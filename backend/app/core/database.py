from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# SQLite needs this special argument
connect_args = {}
if "sqlite" in str(settings.DATABASE_URL):
    connect_args = {"check_same_thread": False}

# Create the database engine
engine = create_engine(str(settings.DATABASE_URL), connect_args=connect_args)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class — all our models inherit from this
Base = declarative_base()


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()