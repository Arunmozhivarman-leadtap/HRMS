from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.user_repository import user_repository
from schemas.employee import EmployeeCreate, BankingInfoUpdate
from core.security import get_password_hash
from models.employee import Employee

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

    def update_banking_info(self, db: Session, employee_id: int, banking_in: BankingInfoUpdate):
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        if banking_in.account_number != banking_in.confirm_account_number:
            raise HTTPException(status_code=400, detail="Account numbers do not match")

        banking_data = banking_in.model_dump(exclude={"confirm_account_number"})
        for field, value in banking_data.items():
            setattr(employee, field, value)
        
        db.commit()
        db.refresh(employee)
        return employee

user_service = UserService()
