
from sqlalchemy import create_engine, inspect
from backend.core.config import settings

def check_schema():
    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('leave_applications')]
    print(f"Columns in leave_applications: {columns}")
    if 'approver_note' in columns:
        print("Success: 'approver_note' column exists.")
    else:
        print("Error: 'approver_note' column is missing!")

if __name__ == "__main__":
    check_schema()
