from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import date
from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.user import User, UserRole
from backend.models.document import DocumentType, EmployeeDocument, DocumentVerificationStatus
from backend.schemas.document import DocumentResponse, DocumentUpdate
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
    if current_user.role == UserRole.employee:
        if current_user.employee_id != employee_id:
            raise HTTPException(status_code=403, detail="Not authorized to upload for another employee")
    
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

@router.get("/list", response_model=List[DocumentResponse])
async def get_documents(
    employee_id: Optional[int] = None,
    document_type: Optional[DocumentType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Role Scoping
    if current_user.role in [UserRole.employee, UserRole.manager]:
        # Employee and Manager can only see their own documents
        return document_repository.get_multi_by_employee(db, current_user.employee_id)
    
    # HR/Admin
    if employee_id:
        return document_repository.get_multi_by_employee(db, employee_id)
    
    # If no employee_id provided, return all (Admin/HR only)
    if current_user.role not in [UserRole.hr_admin, UserRole.super_admin]:
        raise HTTPException(status_code=403, detail="Not authorized to view all documents")
        
    query = db.query(EmployeeDocument)
    if document_type:
        query = query.filter(EmployeeDocument.document_type == document_type)
    return query.all()

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
    if current_user.role in [UserRole.employee, UserRole.manager] and current_user.employee_id != db_doc.employee_id:
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

@router.patch("/{id}/verify", response_model=DocumentResponse)
async def verify_document(
    id: int,
    obj_in: DocumentUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.hr_admin, UserRole.super_admin]:
        raise HTTPException(status_code=403, detail="Not authorized to verify documents")
    
    db_doc = document_repository.get(db, id)
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Update status
    db_doc.verification_status = obj_in.verification_status
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
        # TODO: Filter by team reports
        pass
    
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
    if current_user.role not in [UserRole.hr_admin, UserRole.super_admin]:
        raise HTTPException(status_code=403, detail="Not authorized to view reports")
    
    total_docs = db.query(EmployeeDocument).count()
    verified_docs = db.query(EmployeeDocument).filter(EmployeeDocument.verification_status == DocumentVerificationStatus.verified).count()
    pending_docs = db.query(EmployeeDocument).filter(EmployeeDocument.verification_status == DocumentVerificationStatus.pending).count()
    rejected_docs = db.query(EmployeeDocument).filter(EmployeeDocument.verification_status == DocumentVerificationStatus.rejected).count()
    
    # Expiry risks (within 30 days)
    from datetime import timedelta
    risk_date = date.today() + timedelta(days=30)
    expiry_risks = db.query(EmployeeDocument).filter(EmployeeDocument.expiry_date <= risk_date).count()
    
    return {
        "total_documents": total_docs,
        "verified_percentage": (verified_docs / total_docs * 100) if total_docs > 0 else 0,
        "status_distribution": {
            "verified": verified_docs,
            "pending": pending_docs,
            "rejected": rejected_docs
        },
        "expiry_risks_30_days": expiry_risks
    }
