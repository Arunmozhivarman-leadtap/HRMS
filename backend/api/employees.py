from fastapi import APIRouter, Depends, status, Query, HTTPException, Response, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from schemas.employee import EmployeeCreate, EmployeeResponse, EmployeeUpdate, EmployeeListResponse
from services.employee_service import employee_service
from core.dependencies import get_current_user
from models.user import User, UserRole
from core.permissions import role_required
from utils.file_storage import upload_file

router = APIRouter()

@router.get("/", response_model=EmployeeListResponse)
def get_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=1000),
    search: Optional[str] = None,
    department_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    archived: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items, total = employee_service.get_employees_scoped(
        db, current_user, skip, limit, search, department_id, status_filter, archived
    )
    return {
        "items": items,
        "total": total,
        "page": skip // limit + 1,
        "size": limit
    }

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
@role_required([UserRole.super_admin, UserRole.hr_admin])
def create_employee(
    request: Request,
    employee_in: EmployeeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return employee_service.create_employee(db, employee_in, current_user.id, request.client.host)

@router.get("/export")
@role_required([UserRole.super_admin, UserRole.hr_admin])
def export_employees(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    csv_data = employee_service.export_employees(db, current_user)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employees.csv"}
    )

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # RBAC check for single employee view
    if current_user.role not in [UserRole.super_admin, UserRole.hr_admin]:
        # Manager can view their team
        from repositories.employee_repository import employee_repository
        emp = employee_repository.get_employee_by_id(db, employee_id)
        if not emp:
             raise HTTPException(status_code=404, detail="Employee not found")
        
        if current_user.role == UserRole.manager:
            if emp.manager_id != current_user.employee_id and emp.id != current_user.employee_id:
                raise HTTPException(status_code=403, detail="Not authorized to view this employee")
        elif current_user.role == UserRole.employee:
            if emp.id != current_user.employee_id:
                raise HTTPException(status_code=403, detail="Not authorized to view this employee")
    else:
        from repositories.employee_repository import employee_repository
        emp = employee_repository.get_employee_by_id(db, employee_id)
        if not emp:
             raise HTTPException(status_code=404, detail="Employee not found")

    return emp

@router.patch("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    request: Request,
    employee_id: int,
    employee_in: EmployeeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return employee_service.update_employee(db, current_user, employee_id, employee_in, request.client.host)

@router.post("/{employee_id}/photo", response_model=EmployeeResponse)
def upload_employee_photo(
    employee_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # RBAC: Self or Admin/HR
    if current_user.role not in [UserRole.super_admin, UserRole.hr_admin]:
        if current_user.employee_id != employee_id:
            raise HTTPException(status_code=403, detail="Not authorized to upload photo for this employee")
    
    from repositories.employee_repository import employee_repository
    emp = employee_repository.get_employee_by_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPG and PNG images are allowed")
    
    # Save file
    file_path = upload_file(file, f"employees/{employee_id}")
    
    # Update employee record
    emp.profile_photo = file_path
    db.add(emp)
    db.commit()
    db.refresh(emp)
    
    return emp

@router.post("/{employee_id}/archive", response_model=EmployeeResponse)
@role_required([UserRole.super_admin, UserRole.hr_admin])
def archive_employee(
    request: Request,
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    emp = employee_service.archive_employee(db, employee_id, current_user.id, request.client.host)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.post("/{employee_id}/restore", response_model=EmployeeResponse)
@role_required([UserRole.super_admin, UserRole.hr_admin])
def restore_employee(
    request: Request,
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    emp = employee_service.restore_employee(db, employee_id, current_user.id, request.client.host)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp
