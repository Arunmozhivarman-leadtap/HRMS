from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional, Any, Tuple
from backend.models.settings import CompanySettings, EmploymentType
from backend.models.department import Department
from backend.models.master_data import Designation
from backend.schemas.settings import (
    CompanySettingsUpdate, DepartmentCreate, DesignationCreate, 
    EmploymentTypeCreate
)
from backend.utils.audit import log_action

class SettingsService:
    # --- Company Settings (Singleton) ---
    def get_company_settings(self, db: Session) -> CompanySettings:
        settings = db.query(CompanySettings).first()
        if not settings:
            # Initialize if not exists
            settings = CompanySettings(company_name="LeadTap Digi Solutions")
            db.add(settings)
            db.commit()
            db.refresh(settings)
        return settings

    def update_company_settings(self, db: Session, obj_in: CompanySettingsUpdate, user_id: int, ip_address: str) -> CompanySettings:
        settings = self.get_company_settings(db)
        old_data = {c.name: str(getattr(settings, c.name)) for c in settings.__table__.columns}
        
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(settings, field, value)
        
        db.add(settings)
        db.commit()
        db.refresh(settings)
        
        log_action(
            db, user_id, "UPDATE", "CompanySettings", settings.id,
            details={"old": old_data, "new": {k: str(v) for k, v in update_data.items()}},
            ip_address=ip_address
        )
        return settings

    # --- Generic Master Data CRUD ---
    def _create_master(self, db: Session, model: Any, obj_in: Any, user_id: int, ip_address: str):
        db_obj = model(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        log_action(db, user_id, "CREATE", model.__name__, db_obj.id, details=obj_in.model_dump(), ip_address=ip_address)
        return db_obj

    def _get_masters(self, db: Session, model: Any, skip: int = 0, limit: int = 10, search: Optional[str] = None):
        query = db.query(model)
        if search:
            if hasattr(model, 'name'):
                query = query.filter(model.name.ilike(f"%{search}%"))
        
        total = query.count()
        items = query.order_by(model.id).offset(skip).limit(limit).all()
        return items, total

    def _delete_master(self, db: Session, model: Any, obj_id: int, user_id: int, ip_address: str):
        db_obj = db.query(model).get(obj_id)
        if not db_obj:
            raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
        db.delete(db_obj)
        db.commit()
        log_action(db, user_id, "DELETE", model.__name__, obj_id, ip_address=ip_address)
        return True

    # Master wrappers
    def create_department(self, db: Session, obj_in: DepartmentCreate, user_id: int, ip_address: str):
        return self._create_master(db, Department, obj_in, user_id, ip_address)
    
    def get_departments(self, db: Session, skip: int = 0, limit: int = 10, search: Optional[str] = None):
        return self._get_masters(db, Department, skip, limit, search)

    def create_designation(self, db: Session, obj_in: DesignationCreate, user_id: int, ip_address: str):
        return self._create_master(db, Designation, obj_in, user_id, ip_address)
    
    def get_designations(self, db: Session, skip: int = 0, limit: int = 10, search: Optional[str] = None):
        return self._get_masters(db, Designation, skip, limit, search)

    def create_employment_type(self, db: Session, obj_in: EmploymentTypeCreate, user_id: int, ip_address: str):
        return self._create_master(db, EmploymentType, obj_in, user_id, ip_address)
    
    def get_employment_types(self, db: Session, skip: int = 0, limit: int = 10, search: Optional[str] = None):
        return self._get_masters(db, EmploymentType, skip, limit, search)

settings_service = SettingsService()
