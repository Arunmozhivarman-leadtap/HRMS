from sqlalchemy.orm import Session
from models.audit import AuditLog
from typing import Any, Optional

def log_action(
    db: Session,
    user_id: int,
    action: str,
    entity_type: str,
    entity_id: int,
    details: Optional[Any] = None,
    ip_address: Optional[str] = None
):
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address
    )
    db.add(audit_log)
    db.commit()
