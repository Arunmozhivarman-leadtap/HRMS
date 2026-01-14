from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import date
from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.user import User, UserRole
from backend.models.document import DocumentType, EmployeeDocument, DocumentVerificationStatus
from backend.schemas.document import DocumentResponse, DocumentUpdate
from backend.schemas.document_verification import DocumentVerificationUpdate
from backend.models.employee import Employee
from backend.schemas.api import PaginatedResponse

from backend.repositories.document_repository import document_repository
from backend.utils.file_storage import upload_file, get_file_stream, get_file_path, delete_file
from backend.utils.audit import log_action
from fastapi.responses import StreamingResponse
from fastapi import Request

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/upload", response_model=List[DocumentResponse])
async def upload_documents(
    request: Request,
    employee_id: int = Form(...),
    document_type: str = Form(...),
    expiry_date: Optional[str] = Form(None),
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate document_type
    try:
        doc_type_enum = DocumentType(document_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid document type: {document_type}")

    # Validate/Parse expiry_date
    parsed_expiry = None
    if expiry_date and expiry_date.strip():
        try:
            parsed_expiry = date.fromisoformat(expiry_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Role Scoping
    # Role Scoping
    if current_user.role == UserRole.employee:
        if current_user.employee_id != employee_id:
            raise HTTPException(status_code=403, detail="Not authorized to upload for another employee")
    
    elif current_user.role == UserRole.manager:
        # Manager: Can upload for self OR direct reports
        if current_user.employee_id != employee_id:
            # Check if target is a direct report
            is_report = db.query(Employee).filter(
                Employee.id == employee_id,
                Employee.manager_id == current_user.employee_id
            ).first()
            if not is_report:
                raise HTTPException(status_code=403, detail="Not authorized to upload for this employee")
    
    responses = []
    for file in files:
        # Validate extension
        filename = file.filename or "unnamed"
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"File {filename} has unsupported extension. Allowed: {ALLOWED_EXTENSIONS}"
            )
        
        # Validate size
        file_size = getattr(file, "size", None)
        if file_size is not None and file_size > MAX_FILE_SIZE:
             raise HTTPException(status_code=400, detail=f"File {filename} exceeds 10MB limit")

        # Save file
        sub_folder = f"employees/{employee_id}/{document_type}"
        relative_path = upload_file(file, sub_folder)

        # Create DB record
        db_doc = EmployeeDocument(
            employee_id=employee_id,
            document_type=doc_type_enum,
            file_path=relative_path,
            expiry_date=parsed_expiry,
            verification_status=DocumentVerificationStatus.pending
        )
        saved_doc = document_repository.create(db, db_doc)
        
        log_action(
            db, 
            current_user.id, 
            "upload", 
            "employee_document", 
            saved_doc.id, 
            {"filename": filename},
            request.client.host
        )
        
        responses.append(saved_doc)

    return responses

@router.get("/list", response_model=PaginatedResponse[DocumentResponse])
async def get_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    employee_id: Optional[int] = None,
    document_type: Optional[DocumentType] = None,
    verification_status: Optional[DocumentVerificationStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(EmployeeDocument).join(Employee, EmployeeDocument.employee_id == Employee.id)

    # Role Scoping
    if current_user.role == UserRole.employee:
        query = query.filter(EmployeeDocument.employee_id == current_user.employee_id)
    elif current_user.role == UserRole.manager:
        team_members = db.query(Employee.id).filter(Employee.manager_id == current_user.employee_id).all()
        team_ids = [t[0] for t in team_members]
        if employee_id:
            if employee_id == current_user.employee_id:
                query = query.filter(EmployeeDocument.employee_id == employee_id)
            elif employee_id in team_ids:
                query = query.filter(
                    EmployeeDocument.employee_id == employee_id,
                    EmployeeDocument.verification_status == DocumentVerificationStatus.verified
                )
            else:
                raise HTTPException(status_code=403, detail="Not authorized to view this employee's documents")
        else:
            from sqlalchemy import or_, and_
            query = query.filter(
                or_(
                    EmployeeDocument.employee_id == current_user.employee_id,
                    and_(
                        EmployeeDocument.employee_id.in_(team_ids),
                        EmployeeDocument.verification_status == DocumentVerificationStatus.verified
                    )
                )
            )
    else: # HR/Admin
        if employee_id:
            query = query.filter(EmployeeDocument.employee_id == employee_id)

    if search:
        from sqlalchemy import or_
        query = query.filter(or_(
            Employee.first_name.ilike(f"%{search}%"),
            Employee.last_name.ilike(f"%{search}%")
        ))
    
    if document_type:
        query = query.filter(EmployeeDocument.document_type == document_type)
    if verification_status:
        query = query.filter(EmployeeDocument.verification_status == verification_status)
        
    total = query.count()
    items = query.order_by(EmployeeDocument.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.get("/{id}/download")
async def download_document(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_doc = document_repository.get(db, id)
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Role Scoping
    if current_user.role not in [UserRole.hr_admin, UserRole.super_admin]:
        # Check ownership
        is_owner = current_user.employee_id == db_doc.employee_id
        
        # Check Manager (Team Access)
        is_manager_of_owner = False
        if current_user.role == UserRole.manager:
             owner = db.query(Employee).filter(Employee.id == db_doc.employee_id).first()
             if owner and owner.manager_id == current_user.employee_id:
                 is_manager_of_owner = True
        
        if not is_owner and not is_manager_of_owner:
            raise HTTPException(status_code=403, detail="Not authorized to download this document")
    
    try:
        file_stream = get_file_stream(db_doc.file_path)
        filename = Path(db_doc.file_path).name
        return StreamingResponse(
            file_stream(), 
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found on storage")

# ... verify_document ...
# ... get_expiries ...
# ... delete_document ...
# (skipping intermediate functions as they are not being edited in this chunk, 
# but tool requires contiguous block. I will use the tool targeting separate blocks or one large block if needed.
# Since I need to edit TWO separate functions (download and reports) which are far apart, 
# I should probably use `multi_replace_file_content` or two `replace` calls.
# I will use multi_replace for safety and cleanliness.)


@router.patch("/{id}/verify", response_model=DocumentResponse)
async def verify_document(
    id: int,
    obj_in: DocumentVerificationUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.hr_admin, UserRole.super_admin]:
        raise HTTPException(status_code=403, detail="Not authorized to verify documents")
    
    db_doc = document_repository.get(db, id)
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Validation: Prevent self-verification and enforce HR verification rules
    doc_owner = db_doc.employee
    doc_owner_user = doc_owner.user if doc_owner else None
    
    if doc_owner_user:
        # Prevent self-verification
        if doc_owner_user.id == current_user.id:
            raise HTTPException(status_code=403, detail="You cannot verify your own documents")
            
        # HR Documents must be verified by Super Admin
        if doc_owner_user.role == UserRole.hr_admin and current_user.role != UserRole.super_admin:
            raise HTTPException(status_code=403, detail="HR documents must be verified by a Super Admin")
    
    # Update status
    db_doc.verification_status = obj_in.status
    db_doc.notes = obj_in.notes
    db_doc.verified_by_id = current_user.id
    db_doc.verified_date = func.now()
    
    db.commit()
    db.refresh(db_doc)
    
    log_action(
        db, 
        current_user.id, 
        "verify", 
        "employee_document", 
        db_doc.id, 
        {"status": db_doc.verification_status, "notes": db_doc.notes},
        request.client.host
    )
    
    # TODO: Trigger notifications (upload, verification, reupload)
    
    return db_doc

@router.get("/expiries", response_model=List[DocumentResponse])
async def get_expiries(
    days: int = 90,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import timedelta
    target_date = date.today() + timedelta(days=days)
    
    query = db.query(EmployeeDocument).filter(EmployeeDocument.expiry_date <= target_date)
    
    # Role Scoping
    if current_user.role == UserRole.employee:
        query = query.filter(EmployeeDocument.employee_id == current_user.employee_id)
    elif current_user.role == UserRole.manager:
        # Filter by team reports
        team_members = db.query(Employee.id).filter(Employee.manager_id == current_user.employee_id).all()
        team_ids = [t[0] for t in team_members]
        query = query.filter(EmployeeDocument.employee_id.in_(team_ids))
    
    return query.all()

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_doc = document_repository.get(db, id)
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Role Scoping: Only HR/Admin or the employee themselves can delete (if not verified)
    if current_user.role not in [UserRole.hr_admin, UserRole.super_admin]:
        if current_user.employee_id != db_doc.employee_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this document")
        if db_doc.verification_status == DocumentVerificationStatus.verified:
            raise HTTPException(status_code=400, detail="Cannot delete verified document")

    # Delete local file
    delete_file(db_doc.file_path)
    
    # Delete DB record
    db.delete(db_doc)
    db.commit()
    
    log_action(
        db, 
        current_user.id, 
        "delete", 
        "employee_document", 
        id, 
        {"document_type": db_doc.document_type},
        request.client.host
    )
    
    return None

@router.get("/reports")
async def get_document_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Role Scoping
    query = db.query(EmployeeDocument)
    
    if current_user.role == UserRole.manager:
        # Filter by team
        team_members = db.query(Employee.id).filter(Employee.manager_id == current_user.employee_id).all()
        team_ids = [t[0] for t in team_members]
        query = query.filter(EmployeeDocument.employee_id.in_(team_ids))
    elif current_user.role not in [UserRole.hr_admin, UserRole.super_admin]:
        raise HTTPException(status_code=403, detail="Not authorized to view reports")
    
    # Calculate stats based on scoped query
    total_docs = query.count()
    verified_docs = query.filter(EmployeeDocument.verification_status == DocumentVerificationStatus.verified).count()
    pending_docs = query.filter(EmployeeDocument.verification_status == DocumentVerificationStatus.pending).count()
    rejected_docs = query.filter(EmployeeDocument.verification_status == DocumentVerificationStatus.rejected).count()
    
    # Expiry risks (within 30 days)
    from datetime import timedelta
    risk_date = date.today() + timedelta(days=30)
    expiry_risks = query.filter(EmployeeDocument.expiry_date <= risk_date).count()
    
    return {
        "total_employees": total_docs, # Mapping total_documents to total_employees for frontend/legacy compat
        "total_documents": total_docs,
        "verified_percentage": (verified_docs / total_docs * 100) if total_docs > 0 else 0,
        "pending_count": pending_docs, # Flat key for frontend
        "expiry_risks": expiry_risks, # Flat key for frontend
        "status_distribution": {
            "verified": verified_docs,
            "pending": pending_docs,
            "rejected": rejected_docs
        },
        "expiry_risks_30_days": expiry_risks
    }
