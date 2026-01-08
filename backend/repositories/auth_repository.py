from sqlalchemy.orm import Session
from backend.models.user import User

class AuthRepository:
    def get_user_by_email(self, db: Session, email: str) -> User:
        return db.query(User).filter(User.email == email).first()

    def get_user_by_username(self, db: Session, username: str) -> User:
        return db.query(User).filter(User.username == username).first()

auth_repository = AuthRepository()
