import sys
from pathlib import Path
from datetime import date

# Add project root to python path
project_root = Path(__file__).resolve().parents[1]
sys.path.append(str(project_root))

from backend.core.database import SessionLocal
from backend.models.leave import PublicHoliday, HolidayType

def seed_holidays():
    db = SessionLocal()
    try:
        # Standard Indian Public Holidays for 2026
        holidays = [
            {"name": "New Year's Day", "date": date(2026, 1, 1), "type": HolidayType.national},
            {"name": "Republic Day", "date": date(2026, 1, 26), "type": HolidayType.national},
            {"name": "Holi", "date": date(2026, 3, 4), "type": HolidayType.festival},
            {"name": "Eid-ul-Fitr", "date": date(2026, 3, 20), "type": HolidayType.festival},
            {"name": "Good Friday", "date": date(2026, 4, 3), "type": HolidayType.festival},
            {"name": "Independence Day", "date": date(2026, 8, 15), "type": HolidayType.national},
            {"name": "Ganesh Chaturthi", "date": date(2026, 9, 14), "type": HolidayType.festival},
            {"name": "Mahatma Gandhi Jayanti", "date": date(2026, 10, 2), "type": HolidayType.national},
            {"name": "Dussehra", "date": date(2026, 10, 20), "type": HolidayType.festival},
            {"name": "Diwali", "date": date(2026, 11, 8), "type": HolidayType.festival},
            {"name": "Christmas Day", "date": date(2026, 12, 25), "type": HolidayType.festival},
        ]

        print(f"Seeding {len(holidays)} holidays for 2026...")
        for h_data in holidays:
            # Check if exists
            exists = db.query(PublicHoliday).filter(PublicHoliday.holiday_date == h_data["date"]).first()
            if not exists:
                holiday = PublicHoliday(
                    name=h_data["name"],
                    holiday_date=h_data["date"],
                    holiday_type=h_data["type"]
                )
                db.add(holiday)
                print(f"  Added: {h_data['name']} on {h_data['date']}")
        
        db.commit()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_holidays()
