from typing import Optional
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.security.utils import get_authorization_scheme_param
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from backend.core.database import get_db
from backend.core.config import settings
from backend.repositories.auth_repository import auth_repository

class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """
    Custom dependency to get token from header or cookie.
    """
    async def __call__(self, request: Request) -> Optional[str]:
        # 1. Try Header
        authorization = request.headers.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)
        if authorization and scheme.lower() == "bearer":
            return param
        
        # 2. Try Cookie
        token = request.cookies.get("access_token")
        if token:
            return token
            
        # 3. Fail
        if self.auto_error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return None

oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
             raise HTTPException(status_code=401, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    user = auth_repository.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
