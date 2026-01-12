import os
import sys

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.core.database import Base, engine
from backend.models import *  # Import all models to ensure they are registered
from sqlalchemy import inspect

def check_schema():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")
    
    expected_tables = [
        'users', 'employees', 'leave_types', 'leave_balances', 
        'leave_applications', 'public_holidays'
    ]
    
    for table in expected_tables:
        if table in tables:
            print(f"\nSchema for {table}:")
            columns = inspector.get_columns(table)
            for col in columns:
                print(f"  - {col['name']} ({col['type']})")
        else:
            print(f"\nMISSING TABLE: {table}")

if __name__ == "__main__":
    check_schema()
