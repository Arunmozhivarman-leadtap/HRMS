import secrets
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException

from backend.models.candidate import Candidate, CandidateStatus, CandidateOnboardingTask, OnboardingChecklistItem
from backend.models.employee import Employee
from backend.models.user import User, UserRole
from backend.schemas.onboarding import CandidateCreate, CandidateUpdate
from backend.services.employee_service import employee_service
from backend.schemas.employee import EmployeeCreate
from backend.core.config import settings
from backend.utils.audit import log_action

class OnboardingService:
    
    def create_candidate(self, db: Session, data: CandidateCreate, created_by_id: int) -> Candidate:
        # Check email uniqueness (Candidate + Employee)
        if db.query(Candidate).filter(Candidate.personal_email == data.personal_email).first():
            raise HTTPException(status_code=400, detail="Candidate with this email already exists")
        if db.query(Employee).filter(Employee.email == data.personal_email).first(): # Checking personal email against work email might be loose, but good for safety
             pass # In reality, work email will be different.

        candidate = Candidate(**data.model_dump())
        candidate.status = CandidateStatus.created
        db.add(candidate)
        db.commit()
        db.refresh(candidate)
        
        # Initialize default checklist
        self._initialize_checklist(db, candidate.id)
        
        log_action(db, created_by_id, "CREATE", "Candidate", candidate.id, {"name": candidate.full_name})
        return candidate

    def _initialize_checklist(self, db: Session, candidate_id: int):
        # Create default items if they don't exist
        defaults = [
            {"name": "Accept Offer Letter", "category": "offer", "required": True},
            {"name": "Aadhaar Card", "category": "document", "required": True},
            {"name": "PAN Card", "category": "document", "required": True},
            {"name": "10th Marksheet", "category": "education", "required": True},
            {"name": "12th Marksheet", "category": "education", "required": True},
            {"name": "Degree Certificate", "category": "education", "required": True},
            {"name": "Bank Details", "category": "finance", "required": True},
            {"name": "Passport Photo", "category": "document", "required": True},
        ]
        
        for item in defaults:
            # Check if item definition exists (simplified for MVP)
            checklist_item = db.query(OnboardingChecklistItem).filter(OnboardingChecklistItem.name == item["name"]).first()
            if not checklist_item:
                checklist_item = OnboardingChecklistItem(**item)
                db.add(checklist_item)
                db.flush()
            
            # Create Task
            task = CandidateOnboardingTask(
                candidate_id=candidate_id,
                checklist_item_id=checklist_item.id,
                status="pending"
            )
            db.add(task)
        db.commit()

    def generate_offer_link(self, db: Session, candidate_id: int, expiry_days: int = 7, user_id: int = 0) -> str:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        token = secrets.token_urlsafe(32)
        candidate.offer_token = token
        candidate.offer_token_expiry = datetime.utcnow() + timedelta(days=expiry_days)
        candidate.status = CandidateStatus.sent
        
        db.commit()
        log_action(db, user_id, "SEND_OFFER", "Candidate", candidate.id, {"expiry_days": expiry_days})
        return token

    def get_candidate_by_token(self, db: Session, token: str) -> Candidate:
        candidate = db.query(Candidate).filter(Candidate.offer_token == token).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Invalid offer token")
        
        if candidate.offer_token_expiry and candidate.offer_token_expiry < datetime.utcnow():
             raise HTTPException(status_code=400, detail="Offer link has expired")
             
        return candidate

    def accept_offer(self, db: Session, token: str) -> Candidate:
        candidate = self.get_candidate_by_token(db, token)
        candidate.status = CandidateStatus.accepted
        
        # Also mark the "Accept Offer Letter" task as completed
        offer_task = db.query(CandidateOnboardingTask).join(OnboardingChecklistItem).filter(
            CandidateOnboardingTask.candidate_id == candidate.id,
            OnboardingChecklistItem.name == "Accept Offer Letter"
        ).first()
        
        if offer_task:
            offer_task.status = "completed"
            
        db.commit()
        return candidate

    def reject_offer(self, db: Session, token: str, reason: str) -> Candidate:
        candidate = self.get_candidate_by_token(db, token)
        candidate.status = CandidateStatus.rejected
        candidate.notes = (candidate.notes or "") + f"\n[Offer Rejected]: {reason}"
        db.commit()
        return candidate

    def get_portal_data(self, db: Session, token: str):
        candidate = self.get_candidate_by_token(db, token)
        
        tasks = db.query(CandidateOnboardingTask).filter(CandidateOnboardingTask.candidate_id == candidate.id).all()
        checklist = []
        for t in tasks:
            checklist.append({
                "id": t.id,
                "name": t.checklist_item.name,
                "category": t.checklist_item.category,
                "required": t.checklist_item.required,
                "status": t.status,
                "uploaded_file": t.uploaded_file
            })
            
        return {
            "candidate": candidate,
            "checklist": checklist,
            "offer_valid": True
        }

    def convert_to_employee(self, db: Session, candidate_id: int, admin_user_id: int) -> Employee:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
            
        # 1. Create Employee
        # We need to map Candidate fields to EmployeeCreate
        # Generating a temp password
        temp_password = secrets.token_urlsafe(8)
        
        emp_data = EmployeeCreate(
            first_name=candidate.full_name.split(" ")[0],
            last_name=" ".join(candidate.full_name.split(" ")[1:]) or "Candidate",
            email=candidate.personal_email, # Ideally this should be work email input by Admin during conversion
            password=temp_password,
            phone=candidate.mobile_number,
            date_of_joining=candidate.expected_joining_date,
            designation_id=candidate.designation_id,
            department_id=candidate.department_id,
            manager_id=candidate.reporting_manager_id,
            employment_type=candidate.employment_type,
            role="employee",
            personal_email=candidate.personal_email,
            # Map other fields if possible
        )
        
        # We might need to override the logic in employee_service because it expects unique email 
        # and we are passing personal email as work email initially (or we should ask Admin for it)
        # For prototype, let's append `@leadtap.com` to firstname if not provided
        work_email = f"{candidate.full_name.split(' ')[0].lower()}.{candidate.id}@leadtap.com"
        emp_data.email = work_email
        
        try:
            employee = employee_service.create_employee(db, emp_data, admin_user_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to create employee: {str(e)}")
            
        # 2. Update Candidate Status
        candidate.status = CandidateStatus.onboarding # Or "Converted" if we had it
        # Link candidate to employee? Add employee_id to Candidate model? 
        # For now, just logging it.
        
        log_action(db, admin_user_id, "CONVERT_CANDIDATE", "Employee", employee.id, {"candidate_id": candidate_id})
        
        return employee

onboarding_service = OnboardingService()
