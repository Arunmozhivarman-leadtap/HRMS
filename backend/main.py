from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.core.config import settings
from backend.core.database import Base, engine
from backend.api import auth, users, leaves, documents, onboarding, employees, settings as settings_api, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(leaves.router, prefix="/api/leaves", tags=["leaves"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(onboarding.router, prefix="/api/onboarding", tags=["onboarding"])
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(settings_api.router, prefix="/api/settings", tags=["settings"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

# Mount static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_ROOT), name="uploads")

@app.get("/")
async def root():
    return {"message": "HRMS Backend is running"}