from fastapi import APIRouter, Depends, status, Request, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from core.dependencies import get_current_user
from core.permissions import role_required
from models.user import User, UserRole
from services.settings_service import settings_service
from schemas.settings import (
    CompanySettingsResponse, CompanySettingsUpdate,
    DepartmentResponse, DepartmentCreate,
    DesignationResponse, DesignationCreate,
    EmploymentTypeResponse, EmploymentTypeCreate,
)
from schemas.api import PaginatedResponse
from utils.file_storage import upload_file

router = APIRouter()


@router.get("/company", response_model=CompanySettingsResponse)
@role_required([UserRole.super_admin, UserRole.hr_admin, UserRole.manager, UserRole.employee])
def get_company_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return settings_service.get_company_settings(db)

@router.patch("/company", response_model=CompanySettingsResponse)
@role_required([UserRole.super_admin])
def update_company_settings(
    request: Request,
    obj_in: CompanySettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return settings_service.update_company_settings(db, obj_in, current_user.id, request.client.host)

@router.post("/company/logo", response_model=CompanySettingsResponse)
@role_required([UserRole.super_admin])
def upload_company_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    path = upload_file(file, "branding")
    settings = settings_service.get_company_settings(db)
    settings.logo_url = path
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings

@router.post("/company/letterhead", response_model=CompanySettingsResponse)
@role_required([UserRole.super_admin])
def upload_company_letterhead(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    path = upload_file(file, "branding")
    settings = settings_service.get_company_settings(db)
    settings.letterhead_url = path
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings

# --- Master Data ---

@router.get("/departments", response_model=PaginatedResponse[DepartmentResponse])
@role_required([UserRole.super_admin, UserRole.hr_admin, UserRole.manager, UserRole.employee])
def get_departments(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    items, total = settings_service.get_departments(db, skip=skip, limit=limit, search=search)
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.post("/departments", response_model=DepartmentResponse)
@role_required([UserRole.super_admin, UserRole.hr_admin])
def create_department(request: Request, obj_in: DepartmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return settings_service.create_department(db, obj_in, current_user.id, request.client.host)

@router.get("/designations", response_model=PaginatedResponse[DesignationResponse])
@role_required([UserRole.super_admin, UserRole.hr_admin, UserRole.manager, UserRole.employee])
def get_designations(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    items, total = settings_service.get_designations(db, skip=skip, limit=limit, search=search)
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.post("/designations", response_model=DesignationResponse)
@role_required([UserRole.super_admin, UserRole.hr_admin])
def create_designation(request: Request, obj_in: DesignationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return settings_service.create_designation(db, obj_in, current_user.id, request.client.host)

@router.get("/employment-types", response_model=PaginatedResponse[EmploymentTypeResponse])
@role_required([UserRole.super_admin, UserRole.hr_admin, UserRole.manager, UserRole.employee])
def get_employment_types(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    items, total = settings_service.get_employment_types(db, skip=skip, limit=limit, search=search)
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }

@router.post("/employment-types", response_model=EmploymentTypeCreate)
@role_required([UserRole.super_admin, UserRole.hr_admin])
def create_employment_type(request: Request, obj_in: EmploymentTypeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return settings_service.create_employment_type(db, obj_in, current_user.id, request.client.host)
