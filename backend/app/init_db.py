"""
Database initialization script.
Creates all tables and seeds the first admin user if not exists.

Usage: python -m app.init_db
"""

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base
from app.models import User, Ticket, TicketComment  # noqa: F401 - ensure models registered
from app.services.auth import hash_password


def get_sync_url(async_url: str) -> str:
    """Convert async database URL to sync URL."""
    return async_url.replace("postgresql+asyncpg://", "postgresql://")


def init_db() -> None:
    sync_url = get_sync_url(settings.DATABASE_URL)
    engine = create_engine(sync_url, echo=True)

    # Create all tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    # Seed admin user
    with Session(engine) as session:
        result = session.execute(
            select(User).where(User.email == settings.FIRST_ADMIN_EMAIL)
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print(f"Admin user '{settings.FIRST_ADMIN_EMAIL}' already exists. Skipping seed.")
        else:
            admin = User(
                email=settings.FIRST_ADMIN_EMAIL,
                full_name="Admin",
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role="admin",
                is_approved=True,
                is_active=True,
            )
            session.add(admin)
            session.commit()
            print(f"Admin user '{settings.FIRST_ADMIN_EMAIL}' created successfully.")

    engine.dispose()


if __name__ == "__main__":
    init_db()
