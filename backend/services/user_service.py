from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.repositories.user_repository import user_repository
from backend.schemas.employee import EmployeeCreate
from backend.core.security import get_password_hash

class UserService:
    def create_user(self, db: Session, user_in: EmployeeCreate):
        # Check if user already exists
        user = user_repository.get_user_by_email(db, user_in.email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this email already exists in the system.",
            )
        
        # Hash password and prepare data
        user_data = user_in.model_dump()
        password = user_data.pop("password")
        user_data["hashed_password"] = get_password_hash(password)
        
        return user_repository.create_user(db, user_data)

    def get_users(self, db: Session, skip: int = 0, limit: int = 100):
        return user_repository.get_users(db, skip=skip, limit=limit)

user_service = UserService()
