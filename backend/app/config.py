from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/tuesday"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    FIRST_ADMIN_EMAIL: str = "admin@tuesday.com"
    FIRST_ADMIN_PASSWORD: str = "admin123"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
