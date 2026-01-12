from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.candidate import CandidateOnboardingTask, Candidate
from backend.utils.file_storage import upload_file

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/documents/upload")
async def upload_onboarding_document(
    candidate_id: int = Form(...),
    checklist_item_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if candidate exists
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Validate file
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported extension. Allowed: {ALLOWED_EXTENSIONS}"
        )
    
    # Validate size
    if hasattr(file, "size") and file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds 10MB limit")

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
    else:
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
