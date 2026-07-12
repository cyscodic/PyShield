from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration for the entire application."""

    # App Info
    APP_NAME: str = "PyShield"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./pyshield.db"
    # JWT Authentication
    SECRET_KEY: str = "super-secret-change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Gemini AI
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"


# Create a single instance that the whole app will import
settings = Settings()