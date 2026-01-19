from fastapi import APIRouter, Depends, status, Body, Response
from sqlalchemy.orm import Session
from core.database import get_db
from core.dependencies import get_current_user
from schemas.auth import LoginRequest, Token, SSOLoginRequest
from services.auth_service import auth_service
from core.config import settings

router = APIRouter()

def set_auth_cookies(response: Response, token_data: Token):
    response.set_cookie(
        key="access_token",
        value=token_data.access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False, # Changed to False for HTTP testing
    )
    response.set_cookie(
        key="refresh_token",
        value=token_data.refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax",
        secure=False, # Changed to False for HTTP testing
    )

@router.get("/me")
def get_current_user_info(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "role": current_user.role,
        "employee_id": current_user.employee_id
    }

@router.post("/login")
def login(response: Response, login_data: LoginRequest, db: Session = Depends(get_db)):
    token_data = auth_service.authenticate_user(db, login_data)
    set_auth_cookies(response, token_data)
    return {"role": token_data.role, "user_name": token_data.user_name}

@router.post("/refresh")
def refresh_token(response: Response, refresh_token: str = Body(..., embed=True), db: Session = Depends(get_db)):
    token_data = auth_service.refresh_access_token(db, refresh_token)
    set_auth_cookies(response, token_data)
    return {"status": "success"}

@router.post("/google")
def google_login(response: Response, sso_data: SSOLoginRequest, db: Session = Depends(get_db)):
    token_data = auth_service.authenticate_sso(db, sso_data)
    set_auth_cookies(response, token_data)
    return {"role": token_data.role, "user_name": token_data.user_name}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"status": "success"}
