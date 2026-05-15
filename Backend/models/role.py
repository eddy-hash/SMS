from sqlalchemy import Column, Integer, String
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.v1.dependencies.database import Base

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role_name = Column(String(50), nullable=True)
    name = Column(String(50), nullable=True)
    
    def __repr__(self):
        return f"<Role(id={self.id}, name={self.role_name or self.name})>"
