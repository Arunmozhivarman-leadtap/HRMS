import json
from pathlib import Path
from typing import Dict, List

# Path to permissions.json
# backend/core/permissions.py -> .../docs/permissions.json
PERMISSIONS_FILE = Path(__file__).resolve().parents[2] / "docs" / "permissions.json"

class Permissions:
    _permissions: Dict[str, List[str]] = {}

    @classmethod
    def load(cls):
        if not PERMISSIONS_FILE.exists():
            raise FileNotFoundError(f"Permissions file not found at {PERMISSIONS_FILE}")

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

# Load permissions at module level to make them globally available
try:
    Permissions.load()
    permissions_registry = Permissions.all()
except Exception as e:
    print(f"Failed to load permissions: {e}")
    permissions_registry = {}
