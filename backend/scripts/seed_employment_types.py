from backend.core.database import SessionLocal
from backend.models.settings import EmploymentType

def seed_employment_types():
    db = SessionLocal()
    try:
        types = [
            {"name": "Full-time", "description": "Regular full-time employment"},
            {"name": "Part-time", "description": "Regular part-time employment"},
            {"name": "Contract", "description": "Fixed-term contract employment"},
            {"name": "Intern", "description": "Internship program"},
            {"name": "Freelance", "description": "External freelance worker"},
            {"name": "Consultant", "description": "Specialized consultant"},
        ]
        
        for t in types:
            existing = db.query(EmploymentType).filter(EmploymentType.name == t["name"]).first()
            if not existing:
                db_type = EmploymentType(**t)
                db.add(db_type)
        
        db.commit()
        print("Employment types seeded successfully.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_employment_types()
