from backend.core.database import SessionLocal
from backend.models.master_data import Designation
from backend.models.department import Department

def seed():
    db = SessionLocal()
    try:
        # Designations
        designations = [
            "Software Engineer",
            "Senior Software Engineer",
            "Tech Lead",
            "Project Manager",
            "Product Manager",
            "HR Manager",
            "HR Executive",
            "Accountant",
            "Sales Manager",
            "Sales Executive",
            "Marketing Lead",
            "UI/UX Designer",
            "QA Engineer",
            "System Administrator",
            "Operations Manager"
        ]
        
        for name in designations:
            exists = db.query(Designation).filter(Designation.name == name).first()
            if not exists:
                db.add(Designation(name=name))
        
        # Departments (if empty)
        departments = [
            "Engineering",
            "Human Resources",
            "Sales",
            "Marketing",
            "Finance",
            "Operations",
            "Product"
        ]
        for name in departments:
            exists = db.query(Department).filter(Department.name == name).first()
            if not exists:
                db.add(Department(name=name))


        db.commit()
        print("Master data seeded successfully.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
