from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from jose import jwt, JWTError
from backend.repositories.auth_repository import auth_repository
from backend.core.security import verify_password, create_access_token, create_refresh_token
from backend.core.config import settings
from backend.schemas.auth import LoginRequest, Token, SSOLoginRequest

class AuthService:
    def authenticate_user(self, db: Session, login_data: LoginRequest) -> Token:
        user = auth_repository.get_user_by_email(db, login_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return self._create_tokens(user)

    def refresh_access_token(self, db: Session, refresh_token: str) -> Token:
        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
            
        user = auth_repository.get_user_by_email(db, email)
        if not user:
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        return self._create_tokens(user)

    def authenticate_sso(self, db: Session, sso_data: SSOLoginRequest) -> Token:
        # NOTE: This is a placeholder. In production, verify sso_data.id_token with Google's public keys.
        # For now, we simulate a successful Google login if the token is "mock-google-token"
        
        if sso_data.id_token == "mock-google-token":
            email = "demo@leadtap.com" 
            # Check if user exists, if not, you might auto-register or reject
            user = auth_repository.get_user_by_email(db, email)
            if not user:
                # For this prototype, we'll assume the demo user exists or we fail
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found (SSO)")
            
            return self._create_tokens(user)
        
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid SSO token")

    def _create_tokens(self, user) -> Token:
        # User role is an Enum, need to extract value. 
        # User might not have employee linked (though should), handle gracefully.
        role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
        full_name = user.employee.full_name if user.employee else user.username

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": role_str}, expires_delta=access_token_expires
        )
        
        refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_token = create_refresh_token(
            data={"sub": user.email}, expires_delta=refresh_token_expires
        )
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            role=role_str,
            user_name=full_name
        )

auth_service = AuthService()
