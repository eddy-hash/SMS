from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean, text
from sqlalchemy.orm import relationship
from api.v1.dependencies.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50))
    email = Column(String(100))
    password_hash = Column(String(255))
    role_id = Column(Integer, ForeignKey("roles.id"))
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    profile_image = Column(String(255))
    profile_image_type = Column(String(50))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
    is_active = Column(Boolean, default=True)
    
    role = relationship("Role", back_populates="users")
