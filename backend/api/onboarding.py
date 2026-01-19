from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Body
from sqlalchemy.orm import Session, joinedload
from backend.core.database import get_db
from backend.models.candidate import CandidateOnboardingTask, Candidate
from backend.utils.file_storage import upload_file
from backend.schemas.onboarding import (
    CandidateCreate, CandidateResponse, OfferGenerationRequest, 
    PortalAccessResponse, OfferActionRequest, OnboardingTaskDetail
)
from backend.services.onboarding_service import onboarding_service
from backend.core.dependencies import get_current_user
from backend.models.user import User, UserRole
from backend.core.permissions import role_required

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# --- Admin Endpoints ---

@router.get("/candidates", response_model=List[CandidateResponse])
@role_required([UserRole.super_admin, UserRole.hr_admin])
def get_candidates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Candidate).options(joinedload(Candidate.onboarding_tasks)).order_by(Candidate.created_at.desc()).all()

@router.post("/candidates", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
@role_required([UserRole.super_admin, UserRole.hr_admin])
def create_candidate(
    data: CandidateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return onboarding_service.create_candidate(db, data, current_user.id)

@router.post("/candidates/{id}/offer", response_model=dict)
@role_required([UserRole.super_admin, UserRole.hr_admin])
def send_offer_letter(
    id: int,
    expiry_days: int = Form(7),
    hr_name: str = Form(...),
    hr_email: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    token = onboarding_service.generate_offer_link(db, id, expiry_days, current_user.id, hr_name, hr_email, file)
    return {"message": "Offer generated successfully", "token": token, "link": f"/onboarding/{token}"}

@router.post("/candidates/{id}/convert", status_code=status.HTTP_201_CREATED)
@role_required([UserRole.super_admin, UserRole.hr_admin])
def convert_candidate(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    employee = onboarding_service.convert_to_employee(db, id, current_user.id)
    return {"message": "Candidate converted to employee", "employee_id": employee.id, "email": employee.email}

@router.get("/candidates/{id}/tasks", response_model=List[OnboardingTaskDetail])
@role_required([UserRole.super_admin, UserRole.hr_admin])
def get_candidate_tasks(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch tasks with item details
    tasks = db.query(CandidateOnboardingTask).options(joinedload(CandidateOnboardingTask.checklist_item)).filter(CandidateOnboardingTask.candidate_id == id).all()
    
    # Flatten response to match OnboardingTaskDetail schema
    return [
        {
            "id": t.id,
            "name": t.checklist_item.name if t.checklist_item else "Unknown Task",
            "category": t.checklist_item.category if t.checklist_item else "General",
            "required": t.checklist_item.required if t.checklist_item else False,
            "status": t.status,
            "uploaded_file": t.uploaded_file
        }
        for t in tasks
    ]

# --- Public/Portal Endpoints (Token Based) ---

@router.get("/portal/{token}", response_model=PortalAccessResponse)
def access_onboarding_portal(
    token: str,
    db: Session = Depends(get_db)
):
    return onboarding_service.get_portal_data(db, token)

@router.post("/portal/{token}/offer", response_model=CandidateResponse)
def respond_to_offer(
    token: str,
    data: OfferActionRequest,
    db: Session = Depends(get_db)
):
    if data.action == "accept":
        return onboarding_service.accept_offer(db, token)
    elif data.action == "reject":
        if not data.reason:
            raise HTTPException(status_code=400, detail="Reason required for rejection")
        return onboarding_service.reject_offer(db, token, data.reason)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

@router.post("/portal/{token}/upload")
async def upload_candidate_document(
    token: str,
    task_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate file extensions
    filename = file.filename or "unnamed"
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported extension. Allowed: {ALLOWED_EXTENSIONS}"
        )
    
    # Validate size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File {filename} exceeds 10MB limit")

    file_path = onboarding_service.upload_document_via_token(db, token, task_id, file)
    return {"message": "Document uploaded successfully", "file_path": file_path}

# --- Existing Upload Endpoint (Refined) ---

@router.post("/documents/upload")
async def upload_onboarding_document(
    candidate_id: int = Form(...),
    checklist_item_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Require auth for this one
):
    # This endpoint is for HR Admins to upload on behalf of candidate if needed
    role_required([UserRole.super_admin, UserRole.hr_admin])(current_user)

    # Check if candidate exists
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Validate file
    filename = file.filename or "unnamed"
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported extension. Allowed: {ALLOWED_EXTENSIONS}"
        )
    
    # Validate size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File {filename} exceeds 10MB limit")

    # Save file
    sub_folder = f"candidates/{candidate_id}"
    relative_path = upload_file(file, sub_folder)

    # Update or create onboarding task
    task = db.query(CandidateOnboardingTask).filter(
        CandidateOnboardingTask.candidate_id == candidate_id,
        CandidateOnboardingTask.checklist_item_id == checklist_item_id
    ).first()

    if task:
        task.uploaded_file = relative_path
        task.status = "completed"
        db.commit() # Save changes to existing task
    else:
        # Should usually exist from initialization, but fallback:
        task = CandidateOnboardingTask(
            candidate_id=candidate_id,
            checklist_item_id=checklist_item_id,
            uploaded_file=relative_path,
            status="completed"
        )
        db.add(task)
        db.commit()

    db.refresh(task)

    return {"message": "Document uploaded successfully", "file_path": relative_path}