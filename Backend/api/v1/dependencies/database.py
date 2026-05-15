from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator, Dict, Any, List, Optional
from api.v1.core.config import settings
import logging

logger = logging.getLogger(__name__)

Base = declarative_base()

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BaseRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def execute_query(self, query: str, params: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Execute raw SQL query and return results as list of dicts"""
        try:
            result = self.db.execute(text(query), params or {})
            return [dict(row._mapping) for row in result]
        except Exception as e:
            logger.error(f"Query execution error: {e}")
            return []
    
    def execute_one(self, query: str, params: Optional[Dict] = None) -> Optional[Dict[str, Any]]:
        """Execute query and return single result"""
        try:
            result = self.db.execute(text(query), params or {})
            row = result.first()
            return dict(row._mapping) if row else None
        except Exception as e:
            logger.error(f"Query execution error: {e}")
            return None
    
    def execute_write(self, query: str, params: Optional[Dict] = None) -> bool:
        """Execute write query (INSERT, UPDATE, DELETE)"""
        try:
            self.db.execute(text(query), params or {})
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Write operation error: {e}")
            self.db.rollback()
            return False
