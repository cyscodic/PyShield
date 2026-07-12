from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    """What the user sends when registering."""
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    """What the user sends when logging in."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """What we send back to the user (never the password!)."""
    id: int
    email: str
    full_name: str | None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Allows SQLAlchemy models to convert to this


class Token(BaseModel):
    """The JWT token we return after login."""
    access_token: str
    token_type: str = "bearer"