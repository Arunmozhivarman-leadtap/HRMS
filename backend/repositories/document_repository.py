from sqlalchemy.orm import Session
from typing import List, Optional
from backend.models.document import EmployeeDocument, DocumentVerificationStatus
from backend.schemas.document import DocumentCreate, DocumentUpdate

class DocumentRepository:
    def create(self, db: Session, obj_in: EmployeeDocument) -> EmployeeDocument:
        db.add(obj_in)
        db.commit()
        db.refresh(obj_in)
        return obj_in

    def get(self, db: Session, id: int) -> Optional[EmployeeDocument]:
        return db.query(EmployeeDocument).filter(EmployeeDocument.id == id).first()

    def get_multi_by_employee(self, db: Session, employee_id: int) -> List[EmployeeDocument]:
        return db.query(EmployeeDocument).filter(EmployeeDocument.employee_id == employee_id).all()

    def update(self, db: Session, db_obj: EmployeeDocument, obj_in: DocumentUpdate) -> EmployeeDocument:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, id: int) -> Optional[EmployeeDocument]:
        obj = db.get(EmployeeDocument, id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

document_repository = DocumentRepository()
