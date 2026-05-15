from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from .announcement_models import AnnouncementCategory, AnnouncementPriority, AnnouncementAudience, UserRole

class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category: AnnouncementCategory = AnnouncementCategory.GENERAL
    priority: AnnouncementPriority = AnnouncementPriority.MEDIUM
    audience: AnnouncementAudience = AnnouncementAudience.ALL
    attachments: Optional[List[dict]] = []
    is_pinned: bool = False
    published_at: Optional[datetime] = None
    expiry_date: Optional[datetime] = None

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[AnnouncementCategory] = None
    priority: Optional[AnnouncementPriority] = None
    audience: Optional[AnnouncementAudience] = None
    attachments: Optional[List[dict]] = None
    is_active: Optional[bool] = None
    is_pinned: Optional[bool] = None
    expiry_date: Optional[datetime] = None

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    category: AnnouncementCategory
    priority: AnnouncementPriority
    audience: AnnouncementAudience
    author_id: int
    author_name: str
    author_role: UserRole
    attachments: List[dict]
    is_active: bool
    is_pinned: bool
    created_at: datetime
    updated_at: Optional[datetime]
    published_at: datetime
    expiry_date: Optional[datetime]
    views: int
    is_read: Optional[bool] = False
    
    class Config:
        from_attributes = True

class AnnouncementStats(BaseModel):
    total: int
    unread: int
    urgent: int
    by_category: dict
    by_priority: dict

class MarkAsReadResponse(BaseModel):
    success: bool
    message: str
