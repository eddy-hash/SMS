from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.v1.dependencies.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), nullable=True)
    email = Column(String(100), nullable=True)
    password_hash = Column(String(255), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    profile_image = Column(Text, nullable=True)
    profile_image_type = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Simple relationship without backref to avoid complexity
    role = relationship("Role", foreign_keys=[role_id])
    
    @property
    def full_name(self):
        return self.username or "User"
    
    @property
    def password(self):
        return self.password_hash
    
    @password.setter
    def password(self, value):
        self.password_hash = value
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"
