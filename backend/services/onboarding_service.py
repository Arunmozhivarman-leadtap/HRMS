import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, UploadFile

from pathlib import Path
from backend.models.candidate import Candidate, CandidateStatus, CandidateOnboardingTask, OnboardingChecklistItem
from backend.models.employee import Employee
from backend.models.user import User, UserRole
from backend.schemas.onboarding import CandidateCreate, CandidateUpdate
from backend.services.employee_service import employee_service
from backend.services.leave_service import leave_service
from backend.services.email_service import email_service
from backend.schemas.employee import EmployeeCreate
from backend.core.config import settings
from backend.utils.audit import log_action
from backend.utils.file_storage import upload_file, get_file_path

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

    def generate_offer_link(self, db: Session, candidate_id: int, expiry_days: int, user_id: int, hr_name: str, hr_email: str, offer_file: Optional[UploadFile] = None) -> str:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        token = secrets.token_urlsafe(32)
        candidate.offer_token = token
        candidate.offer_token_expiry = datetime.now(timezone.utc) + timedelta(days=expiry_days)
        candidate.status = CandidateStatus.sent
        
        attachments = []

        # Handle Offer File Upload
        if offer_file:
            # Save properly
            sub_folder = f"candidates/{candidate.id}/offer"
            relative_path = upload_file(offer_file, sub_folder)
            
            # Store metadata
            if not candidate.salary_structure:
                candidate.salary_structure = {}
            if isinstance(candidate.salary_structure, dict):
                 candidate.salary_structure["offer_document"] = relative_path
            
            # Add to attachments
            try:
                abs_path = get_file_path(relative_path)
                attachments.append(abs_path)
            except Exception as e:
                print(f"Error resolving attachment path: {e}")
        
        db.commit()
        
        # Fetch Dynamic Details for Email
        from backend.models.settings import CompanySettings, EmploymentType
        from backend.models.master_data import Designation
        
        company_settings = db.query(CompanySettings).first()
        company_name = company_settings.company_name if company_settings else "LeadTap Digi Solutions"
        
        designation = db.query(Designation).filter(Designation.id == candidate.designation_id).first()
        position_name = designation.name if designation else "Employee"

        # Offer Expiry Date String
        expiry_date_str = candidate.offer_token_expiry.strftime("%d %b %Y")
        
        # Construct Link
        # Assuming frontend is hosted at same domain root or configured.
        # Ideally this comes from settings.FRONTEND_URL, defaulting to localhost for dev.
        frontend_link = f"http://localhost:3000/onboarding/{token}"
        
        # Spec 2.0 Email Template
        email_subject = f"Offer of Employment - {position_name} at {company_name}"
        
        email_body = f"""
Dear {candidate.full_name},

We are pleased to inform you that you have been selected for the
position
of {position_name} at {company_name}.

Please find attached your offer letter with complete details of your
compensation and terms of employment.

To view and accept your offer, please click the link below:

{frontend_link}

This offer is valid until {expiry_date_str}.

If you have any questions, please don't hesitate to contact
{hr_name}
at {hr_email}.

We look forward to welcoming you to the team!

Best regards,
{hr_name}
Human Resources
{company_name}
        """
        
        # Send Email (with attachments if any)
        email_service.send_email(candidate.personal_email, email_subject, email_body, attachments=attachments)

        log_action(db, user_id, "SEND_OFFER", "Candidate", candidate.id, {"expiry_days": expiry_days, "hr_name": hr_name})
        return token



    def get_candidate_by_token(self, db: Session, token: str) -> Candidate:
        candidate = db.query(Candidate).filter(Candidate.offer_token == token).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Invalid offer token")
        
        if candidate.offer_token_expiry and candidate.offer_token_expiry < datetime.now(timezone.utc):
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

        # Notify HR and Creator
        recipients = {settings.SMTP_FROM_EMAIL} # Default HR/Admin email

        # Find Creator via Audit Log
        from backend.models.audit import AuditLog
        from backend.models.user import User
        
        creator_log = db.query(AuditLog).filter(
            AuditLog.entity_type == "Candidate",
            AuditLog.entity_id == candidate.id,
            AuditLog.action == "CREATE"
        ).first()
        
        if creator_log:
            creator_user = db.query(User).filter(User.id == creator_log.user_id).first()
            if creator_user and creator_user.email:
                recipients.add(creator_user.email)

        for email in recipients:
            email_service.send_email(
                email,
                f"Offer Accepted: {candidate.full_name}",
                f"Candidate {candidate.full_name} has accepted the offer. Onboarding checklist is now active."
            )

        return candidate

    def reject_offer(self, db: Session, token: str, reason: str) -> Candidate:
        candidate = self.get_candidate_by_token(db, token)
        candidate.status = CandidateStatus.rejected
        candidate.notes = (candidate.notes or "") + f"\n[Offer Rejected]: {reason}"
        db.commit()
        
        # Notify HR
        email_service.send_email(
            settings.SMTP_FROM_EMAIL,
            f"Offer Rejected: {candidate.full_name}",
            f"Candidate {candidate.full_name} has rejected the offer.\nReason: {reason}"
        )

        return candidate

    def get_portal_data(self, db: Session, token: str):
        candidate = self.get_candidate_by_token(db, token)
        
        # Eager load checklist item to avoid N+1 and attribute errors
        tasks = db.query(CandidateOnboardingTask).options(joinedload(CandidateOnboardingTask.checklist_item)).filter(CandidateOnboardingTask.candidate_id == candidate.id).all()
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
            
        # Fetch Company Settings
        from backend.models.settings import CompanySettings
        company_settings = db.query(CompanySettings).first()
        company_name = company_settings.company_name if company_settings else "LeadTap Digi Solutions"
        logo_url = company_settings.logo_url if company_settings and hasattr(company_settings, 'logo_url') else None

        return {
            "candidate": candidate,
            "checklist": checklist,
            "offer_valid": True,
            "company_name": company_name,
            "logo_url": logo_url
        }

    def upload_document_via_token(self, db: Session, token: str, task_id: int, file: UploadFile) -> str:
        candidate = self.get_candidate_by_token(db, token) # Validates token and expiry
        
        # Validate file
        filename = file.filename or "unnamed"
        ext = Path(filename).suffix.lower()
        # Allowed extensions should ideally be checked here or in API
        
        # Save file
        sub_folder = f"candidates/{candidate.id}"
        relative_path = upload_file(file, sub_folder)

        # Update task
        task = db.query(CandidateOnboardingTask).filter(
            CandidateOnboardingTask.id == task_id,
            CandidateOnboardingTask.candidate_id == candidate.id
        ).first()

        if task:
            task.uploaded_file = relative_path
            task.status = "completed"
            db.commit()
            db.refresh(task)
        else:
             raise HTTPException(status_code=404, detail="Task not found for this candidate")
            
        return relative_path

    def convert_to_employee(self, db: Session, candidate_id: int, admin_user_id: int) -> Employee:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
            
        # 1. Create Employee
        # Generating a temp password
        temp_password = secrets.token_urlsafe(8)
        
        emp_data = EmployeeCreate(
            first_name=candidate.full_name.split(" ")[0],
            last_name=" ".join(candidate.full_name.split(" ")[1:]) or "Candidate",
            email=candidate.personal_email, 
            password=temp_password,
            phone=candidate.mobile_number,
            date_of_joining=candidate.expected_joining_date,
            designation_id=candidate.designation_id,
            department_id=candidate.department_id,
            manager_id=candidate.reporting_manager_id,
            employment_type=candidate.employment_type,
            role="employee",
            personal_email=candidate.personal_email,
        )
        
        # Determine work email (simple logic)
        work_email = f"{candidate.full_name.split(' ')[0].lower()}.{candidate.id}@leadtap.com"
        emp_data.email = work_email
        
        try:
            employee = employee_service.create_employee(db, emp_data, admin_user_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to create employee: {str(e)}")
            
        # 2. Update Candidate Status
        candidate.status = CandidateStatus.onboarding 
        
        # 3. Initialize Leave Balances
        try:
            leave_service.initialize_leave_types(db) # Ensure types exist
            leave_service.calculate_pro_rata_accrual(db, employee.id, date.today().year)
        except Exception as e:
            # Log error but don't fail the conversion? Or fail?
            # Better to fail to ensure data consistency or at least log heavily.
            print(f"Error initializing leaves: {e}")

        log_action(db, admin_user_id, "CONVERT_CANDIDATE", "Employee", employee.id, {"candidate_id": candidate_id})

        # Send Welcome Email
        email_body = f"""
        Welcome to the team, {employee.first_name}!
        
        Your employee account has been created.
        
        Work Email: {employee.email}
        Temporary Password: {temp_password}
        
        Please login at {settings.API_V1_STR.replace('/api', '')} and change your password immediately.
        """
        email_service.send_email(candidate.personal_email, "Welcome to LeadTap!", email_body)
        
        return employee

onboarding_service = OnboardingService()
