from sqlalchemy.orm import Session
from backend.models.employee import Employee

class UserRepository:
    def get_user_by_email(self, db: Session, email: str):
        return db.query(Employee).filter(Employee.email == email).first()

    def create_user(self, db: Session, user_data: dict):
        db_user = Employee(**user_data)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def get_users(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(Employee).offset(skip).limit(limit).all()

user_repository = UserRepository()
