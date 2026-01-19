from fastapi import APIRouter, Depends, HTTPException, status, Query, Form, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from core.database import get_db
from services.leave_service import leave_service
from repositories.leave_repository import leave_repository
from schemas.leave import (
    LeaveApplicationCreate, LeaveApplicationResponse, 
    LeaveBalanceResponse, LeaveTypeResponse, PublicHolidayResponse,
    LeaveTypeBase, LeaveApprovalAction, PublicHolidayCreate, PublicHolidayUpdate,
    LeaveRecallRequest
)
from schemas.leave_credit import LeaveCreditRequestCreate, LeaveCreditRequestResponse
from core.dependencies import get_current_user
from schemas.api import PaginatedResponse

router = APIRouter()

@router.get("/calendar/team", response_model=List[LeaveApplicationResponse])
def get_team_calendar(
    from_date: date,
    to_date: date,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    
    return leave_service.get_team_calendar(db, current_user.employee_id, from_date, to_date)


@router.get("/types", response_model=List[LeaveTypeResponse])
def get_leave_types(db: Session = Depends(get_db)):
    # Ensure initialized (lazy init for prototype)
    leave_service.initialize_leave_types(db)
    return leave_repository.get_leave_types(db)

@router.post("/types", response_model=LeaveTypeResponse)
def create_leave_type(
    data: LeaveTypeBase,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super_admin can create leave types")
    return leave_service.create_leave_type(db, data.model_dump())

@router.put("/types/{lt_id}", response_model=LeaveTypeResponse)
def update_leave_type(
    lt_id: int,
    data: LeaveTypeBase,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super_admin can update leave types")
    return leave_service.update_leave_type(db, lt_id, data.model_dump())

@router.delete("/types/{lt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_leave_type(
    lt_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super_admin can delete leave types")
    leave_service.delete_leave_type(db, lt_id)
    return None

@router.get("/balances/my", response_model=List[LeaveBalanceResponse])
def get_my_balances(
    year: int = Query(default=date.today().year),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    return leave_service.get_employee_balances(db, current_user.employee_id, year)

@router.get("/balances/team", response_model=PaginatedResponse[LeaveBalanceResponse])
def get_team_balances(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    year: int = Query(default=date.today().year),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    
    items, total = leave_service.get_team_balances(db, current_user.employee_id, year, skip=skip, limit=limit, search=search)
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.get("/balances/all", response_model=PaginatedResponse[LeaveBalanceResponse])
def get_all_balances(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    year: int = Query(default=date.today().year),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    items, total = leave_service.get_all_balances(db, year, skip=skip, limit=limit, search=search)
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.post("/apply", response_model=LeaveApplicationResponse)
def apply_leave(
    leave_type_id: int = Form(...),
    duration_type: str = Form("Full Day"),
    from_date: date = Form(...),
    to_date: Optional[date] = Form(None),
    number_of_days: float = Form(...),
    reason: str = Form(...),
    contact_email: Optional[str] = Form(None),
    contact_phone: Optional[str] = Form(None),
    attachment: Optional[UploadFile] = File(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    
    application_data = LeaveApplicationCreate(
        leave_type_id=leave_type_id,
        duration_type=duration_type,
        from_date=from_date,
        to_date=to_date,
        number_of_days=number_of_days,
        reason=reason,
        contact_email=contact_email,
        contact_phone=contact_phone
    )
    
    # We pass the attachment separately to the service
    return leave_service.apply_leave(db, application_data, current_user.employee_id, attachment)

@router.get("/applications/my", response_model=PaginatedResponse[LeaveApplicationResponse])
def get_my_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    year: Optional[int] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    items, total = leave_repository.get_applications(db, skip=skip, limit=limit, employee_id=current_user.employee_id, year=year)
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.get("/applications/team", response_model=PaginatedResponse[LeaveApplicationResponse])
def get_team_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    year: Optional[int] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    items, total = leave_service.get_team_applications(db, current_user.employee_id, skip=skip, limit=limit, year=year, search=search)
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.get("/applications/all", response_model=PaginatedResponse[LeaveApplicationResponse])
def get_all_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    year: Optional[int] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    items, total = leave_repository.get_applications(db, skip=skip, limit=limit, year=year, search=search)
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.get("/approvals/pending", response_model=PaginatedResponse[LeaveApplicationResponse])
def get_pending_approvals(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="User is not linked to an employee record")

    if current_user.role in ['hr_admin', 'super_admin']:
        items, total = leave_repository.get_applications(db, skip=skip, limit=limit, status="pending", search=search, exclude_employee_id=current_user.employee_id)
    else:
        items, total = leave_repository.get_pending_applications_for_approver(db, current_user.employee_id, skip=skip, limit=limit, search=search)
    
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.post("/approve/{application_id}", response_model=LeaveApplicationResponse)
def approve_leave_request(
    application_id: int,
    action: LeaveApprovalAction = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="Approver must be an employee")

    comments = action.comments if action else None
    return leave_service.approve_leave(db, application_id, current_user.employee_id, role=current_user.role, comments=comments)

@router.post("/reject/{application_id}", response_model=LeaveApplicationResponse)
def reject_leave_request(
    application_id: int,
    action: LeaveApprovalAction = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")

    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="Approver must be an employee")
         
    comments = action.comments if action else None
    return leave_service.reject_leave(db, application_id, current_user.employee_id, comments=comments)

@router.post("/recall/{application_id}", response_model=LeaveApplicationResponse)
def recall_leave_request(
    application_id: int,
    data: LeaveRecallRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")

    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="Approver must be an employee")
         
    return leave_service.recall_leave(
        db, 
        application_id, 
        current_user.employee_id, 
        data.recall_date, 
        data.reason
    )

@router.put("/update/{application_id}", response_model=LeaveApplicationResponse)
def update_leave_request(
    application_id: int,
    leave_type_id: int = Form(...),
    duration_type: str = Form("Full Day"),
    from_date: date = Form(...),
    to_date: Optional[date] = Form(None),
    number_of_days: float = Form(...),
    reason: str = Form(...),
    contact_email: Optional[str] = Form(None),
    contact_phone: Optional[str] = Form(None),
    attachment: Optional[UploadFile] = File(None),
    clear_attachment: bool = Form(False),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
        
    application_data = LeaveApplicationCreate(
        leave_type_id=leave_type_id,
        duration_type=duration_type,
        from_date=from_date,
        to_date=to_date,
        number_of_days=number_of_days,
        reason=reason,
        contact_email=contact_email,
        contact_phone=contact_phone
    )
    
    return leave_service.update_leave(db, application_id, application_data, current_user.employee_id, attachment, clear_attachment)

@router.delete("/cancel/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_leave_request(
    application_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    leave_service.cancel_leave(db, application_id, current_user.employee_id)
    return None

@router.get("/stats")
def get_leave_statistics(
    year: int = Query(default=date.today().year),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['hr_admin', 'super_admin', 'manager']:
         raise HTTPException(status_code=403, detail="Not authorized")
    return leave_service.get_leave_stats(db, year)

@router.get("/analytics")
def get_leave_analytics(
    year: int = Query(default=date.today().year),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    return leave_service.get_leave_analytics(db, year)

@router.get("/holidays", response_model=List[PublicHolidayResponse])
def get_holidays(
    year: int = Query(default=date.today().year),
    db: Session = Depends(get_db)
):
    return leave_repository.get_holidays(db, year)

@router.post("/holidays", response_model=PublicHolidayResponse)
def create_holiday(
    data: PublicHolidayCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['hr_admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Not authorized")
    return leave_service.create_holiday(db, data.model_dump())

@router.put("/holidays/{holiday_id}", response_model=PublicHolidayResponse)
def update_holiday(
    holiday_id: int,
    data: PublicHolidayUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['hr_admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Not authorized")
    return leave_service.update_holiday(db, holiday_id, data.model_dump(exclude_unset=True))

@router.delete("/holidays/{holiday_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_holiday(
    holiday_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['hr_admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Not authorized")
    leave_service.delete_holiday(db, holiday_id)
    return None

@router.get("/holidays/restricted", response_model=List[PublicHolidayResponse])
def get_restricted_holidays(
    year: int = Query(default=date.today().year),
    db: Session = Depends(get_db)
):
    return leave_repository.get_restricted_holidays(db, year)

@router.get("/applications/{application_id}/attachment")
def get_leave_attachment(
    application_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from utils.file_storage import get_file_stream
    import os
    
    app = leave_repository.get_application(db, application_id)
    if not app or not app.attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    # Check authorization
    if current_user.role == 'employee' and current_user.employee_id != app.employee_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        file_stream = get_file_stream(app.attachment)
        filename = os.path.basename(app.attachment)
        return StreamingResponse(
            file_stream(),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"File error: {str(e)}")

# --- Credit Request Endpoints ---

@router.post("/credit", response_model=LeaveCreditRequestResponse)
def request_leave_credit(
    data: LeaveCreditRequestCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    return leave_service.request_leave_credit(db, data, current_user.employee_id)

@router.get("/credit/my", response_model=PaginatedResponse[LeaveCreditRequestResponse])
def get_my_credit_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    items, total = leave_service.get_my_credit_requests(db, current_user.employee_id, skip=skip, limit=limit)
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.get("/credit/pending", response_model=PaginatedResponse[LeaveCreditRequestResponse])
def get_pending_credit_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    items, total = leave_service.get_pending_credit_requests(db, current_user.employee_id, current_user.role, skip=skip, limit=limit, search=search)
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.post("/credit/{req_id}/approve", response_model=LeaveCreditRequestResponse)
def approve_leave_credit(
    req_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    return leave_service.approve_leave_credit(db, req_id, current_user.employee_id)

@router.post("/credit/{req_id}/reject", response_model=LeaveCreditRequestResponse)
def reject_leave_credit(
    req_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    return leave_service.reject_leave_credit(db, req_id, current_user.employee_id)
