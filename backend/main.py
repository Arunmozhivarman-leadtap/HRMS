from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.api import auth, users, leaves, documents, onboarding
from backend.core.database import engine, Base
import backend.models

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

@app.get("/")
async def root():
    return {"message": "HRMS Backend is running"}