
from sqlalchemy import create_engine, text
from backend.core.config import settings
from backend.core.database import Base, engine as db_engine
import backend.models # Register all models

def migrate():
    print("Starting manual migration...")
    
    # Use direct engine from config to ensure we are using the right connection string logic
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking/Adding 'gender' to employees...")
        try:
            conn.execute(text("ALTER TABLE employees ADD COLUMN IF NOT EXISTS gender VARCHAR(10)"))
            print(" - 'gender' column checked/added.")
        except Exception as e:
            print(f" - Error adding gender: {e}")

        print("Checking/Adding columns to leave_types...")
        try:
            conn.execute(text("ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS gender_eligibility VARCHAR(20) DEFAULT 'All'"))
            print(" - 'gender_eligibility' column checked/added.")
        except Exception as e:
            print(f" - Error adding gender_eligibility: {e}")

        try:
            conn.execute(text("ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS requires_document BOOLEAN DEFAULT FALSE"))
            print(" - 'requires_document' column checked/added.")
        except Exception as e:
            print(f" - Error adding requires_document: {e}")

        print("Checking/Adding columns to leave_applications...")
        try:
            conn.execute(text("ALTER TABLE leave_applications ADD COLUMN IF NOT EXISTS approver_note TEXT"))
            print(" - 'approver_note' column checked/added.")
        except Exception as e:
            print(f" - Error adding approver_note: {e}")

        conn.commit()
    
    print("Running Base.metadata.create_all to create new tables if missing...")
    Base.metadata.create_all(bind=engine)
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
