import json
import asyncio
from pathlib import Path
from typing import Dict, List

# Path to permissions.json
# backend/core/permissions.py -> .../docs/permissions.json
PERMISSIONS_FILE = Path(__file__).resolve().parents[2] / "docs" / "permissions.json"

from functools import wraps
from fastapi import HTTPException, status, Depends
from core.dependencies import get_current_user
from models.user import User, UserRole

class Permissions:
    _permissions: Dict[str, List[str]] = {}

    @classmethod
    def load(cls):
        if not PERMISSIONS_FILE.exists():
            # If not exists, just return empty list or log
            print(f"Permissions file not found at {PERMISSIONS_FILE}")
            return

        with open(PERMISSIONS_FILE, "r") as f:
            cls._permissions = json.load(f)

    @classmethod
    def get_role_permissions(cls, role: str) -> List[str]:
        if not cls._permissions:
            cls.load()
        return cls._permissions.get(role, [])

    @classmethod
    def all(cls) -> Dict[str, List[str]]:
        if not cls._permissions:
            cls.load()
        return cls._permissions

def role_required(allowed_roles: List[UserRole]):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Try to get current_user from kwargs (FastAPI injects it if it's in the signature)
            current_user: User = kwargs.get("current_user")
            
            # If not in kwargs, it might be in args or we might need to raise error
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not authenticated or missing current_user dependency"
                )
            
            # Extract string value if it's an enum
            user_role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
            allowed_role_values = [r.value if hasattr(r, "value") else r for r in allowed_roles]

            if user_role not in allowed_role_values:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to perform this action"
                )
            
            if asyncio.iscoroutinefunction(func):
                return await func(*args, **kwargs)
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Load permissions at module level to make them globally available
try:
    Permissions.load()
    permissions_registry = Permissions.all()
except Exception as e:
    print(f"Failed to load permissions: {e}")
    permissions_registry = {}
