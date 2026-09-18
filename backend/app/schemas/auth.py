from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120, examples=["Priya Sharma"])
    email: EmailStr = Field(..., examples=["priya@example.com"])
    password: str = Field(..., min_length=6, max_length=128, examples=["SecurePassword123!"])
    phone: Optional[str] = Field(None, max_length=25, examples=["+919876543210"])


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["priya@example.com"])
    password: str = Field(..., examples=["SecurePassword123!"])


class UserTokenPayload(BaseModel):
    id: str
    full_name: str
    email: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserTokenPayload
