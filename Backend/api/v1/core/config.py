import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = "East Africa University"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "1234")
    DB_NAME: str = os.getenv("DB_NAME", "university_portal")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "edagr")
    ADMIN_PASSWORD_HASH: str = os.getenv(
        "ADMIN_PASSWORD_HASH",
        "$2b$12$CwYCCFiIyTvRj035OHST.OK19I5BLRk9xTLzzcbM6l.ncff3LqfJq"
    )
    
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
