from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str
    user_name: str

class TokenData(BaseModel):
    email: str | None = None

class SSOLoginRequest(BaseModel):
    id_token: str
    provider: str = "google"
