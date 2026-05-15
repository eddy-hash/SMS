from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional, Dict, Any
from api.v1.core.database import BaseRepository
from api.v1.core.announcement_models import AnnouncementCategory, AnnouncementPriority, UserRole

class AnnouncementService:
    
    @staticmethod
    def create_tables(db: Session):
        from api.v1.core.announcement_models import CREATE_ANNOUNCEMENTS_TABLE, CREATE_READ_RECEIPTS_TABLE
        repo = BaseRepository(db)
        repo.execute_write(CREATE_ANNOUNCEMENTS_TABLE)
        repo.execute_write(CREATE_READ_RECEIPTS_TABLE)
    
    @staticmethod
    def can_post_announcement(user_role: str) -> bool:
        return user_role in [UserRole.ADMIN.value, UserRole.STAFF.value, UserRole.TEACHER.value]
    
    @staticmethod
    def get_announcements(db: Session, user_id: int, user_role: str, skip: int = 0, limit: int = 50, category: Optional[str] = None, priority: Optional[str] = None) -> List[Dict[str, Any]]:
        repo = BaseRepository(db)
        query = "SELECT * FROM announcements WHERE is_active = TRUE AND published_at <= NOW() AND (expiry_date IS NULL OR expiry_date >= NOW())"
        params = {}
        if user_role == UserRole.STUDENT.value:
            query += " AND audience IN ('all', 'students')"
        elif user_role == UserRole.TEACHER.value:
            query += " AND audience IN ('all', 'teachers')"
        elif user_role == UserRole.STAFF.value:
            query += " AND audience IN ('all', 'staff')"
        if category:
            query += " AND category = :category"
            params['category'] = category
        if priority:
            query += " AND priority = :priority"
            params['priority'] = priority
        query += " ORDER BY is_pinned DESC, published_at DESC LIMIT :limit OFFSET :skip"
        params['limit'] = limit
        params['skip'] = skip
        return repo.execute_query(query, params)
    
    @staticmethod
    def get_announcement_by_id(db: Session, announcement_id: int) -> Optional[Dict[str, Any]]:
        repo = BaseRepository(db)
        return repo.execute_one("SELECT * FROM announcements WHERE id = :id AND is_active = TRUE", {"id": announcement_id})
    
    @staticmethod
    def get_user_announcements(db: Session, user_id: int, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        repo = BaseRepository(db)
        return repo.execute_query("SELECT * FROM announcements WHERE author_id = :user_id AND is_active = TRUE ORDER BY published_at DESC LIMIT :limit OFFSET :skip", {"user_id": user_id, "limit": limit, "skip": skip})
    
    @staticmethod
    def create_announcement(db: Session, announcement_data: Dict[str, Any], author_id: int, author_name: str, author_role: str) -> Optional[Dict[str, Any]]:
        repo = BaseRepository(db)
        
        # Prepare data with defaults
        title = announcement_data.get("title")
        content = announcement_data.get("content")
        category = announcement_data.get("category", "general")
        priority = announcement_data.get("priority", "medium")
        audience = announcement_data.get("audience", "all")
        attachments = announcement_data.get("attachments", [])
        is_pinned = announcement_data.get("is_pinned", False)
        published_at = announcement_data.get("published_at", datetime.utcnow())
        expiry_date = announcement_data.get("expiry_date")
        
        # Validate required fields
        if not title or not content:
            print(f"Missing required fields: title={title}, content={content}")
            return None
        
        query = """
            INSERT INTO announcements (
                title, content, category, priority, audience, 
                author_id, author_name, author_role, attachments, 
                is_pinned, published_at, expiry_date
            ) VALUES (
                :title, :content, :category, :priority, :audience,
                :author_id, :author_name, :author_role, :attachments,
                :is_pinned, :published_at, :expiry_date
            )
        """
        
        params = {
            "title": title,
            "content": content,
            "category": category,
            "priority": priority,
            "audience": audience,
            "author_id": author_id,
            "author_name": author_name,
            "author_role": author_role,
            "attachments": attachments,
            "is_pinned": is_pinned,
            "published_at": published_at,
            "expiry_date": expiry_date
        }
        
        print(f"Inserting announcement with params: {params}")
        
        success = repo.execute_write(query, params)
        
        if success:
            # Get the last inserted ID
            last_id = repo.execute_one("SELECT LAST_INSERT_ID() as id")
            if last_id:
                return AnnouncementService.get_announcement_by_id(db, last_id["id"])
        
        return None
    
    @staticmethod
    def update_announcement(db: Session, announcement_id: int, announcement_data: Dict[str, Any], user_id: int, user_role: str) -> Optional[Dict[str, Any]]:
        announcement = AnnouncementService.get_announcement_by_id(db, announcement_id)
        if not announcement or (announcement["author_id"] != user_id and user_role != UserRole.ADMIN.value):
            return None
        repo = BaseRepository(db)
        update_fields = []
        params = {"id": announcement_id}
        for field in ["title", "content", "category", "priority", "audience", "attachments", "is_pinned", "expiry_date"]:
            if field in announcement_data and announcement_data[field] is not None:
                update_fields.append(f"{field} = :{field}")
                params[field] = announcement_data[field]
        if not update_fields:
            return announcement
        if repo.execute_write(f"UPDATE announcements SET {', '.join(update_fields)}, updated_at = NOW() WHERE id = :id", params):
            return AnnouncementService.get_announcement_by_id(db, announcement_id)
        return None
    
    @staticmethod
    def delete_announcement(db: Session, announcement_id: int, user_id: int, user_role: str) -> bool:
        announcement = AnnouncementService.get_announcement_by_id(db, announcement_id)
        if not announcement or (announcement["author_id"] != user_id and user_role != UserRole.ADMIN.value):
            return False
        repo = BaseRepository(db)
        return repo.execute_write("UPDATE announcements SET is_active = FALSE WHERE id = :id", {"id": announcement_id})
    
    @staticmethod
    def mark_as_read(db: Session, announcement_id: int, user_id: int) -> bool:
        repo = BaseRepository(db)
        existing = repo.execute_one("SELECT id FROM announcement_read_receipts WHERE announcement_id = :aid AND user_id = :uid", {"aid": announcement_id, "uid": user_id})
        if not existing:
            return repo.execute_write("INSERT INTO announcement_read_receipts (announcement_id, user_id) VALUES (:aid, :uid)", {"aid": announcement_id, "uid": user_id})
        return True
    
    @staticmethod
    def increment_views(db: Session, announcement_id: int) -> None:
        repo = BaseRepository(db)
        repo.execute_write("UPDATE announcements SET views = views + 1 WHERE id = :id", {"id": announcement_id})
    
    @staticmethod
    def get_read_status(db: Session, announcement_id: int, user_id: int) -> bool:
        repo = BaseRepository(db)
        return repo.execute_one("SELECT id FROM announcement_read_receipts WHERE announcement_id = :aid AND user_id = :uid", {"aid": announcement_id, "uid": user_id}) is not None
    
    @staticmethod
    def get_stats(db: Session, user_id: int, user_role: str) -> Dict[str, Any]:
        announcements = AnnouncementService.get_announcements(db, user_id, user_role, limit=10000)
        total = len(announcements)
        unread = sum(1 for a in announcements if not AnnouncementService.get_read_status(db, a["id"], user_id))
        urgent = sum(1 for a in announcements if a.get("priority") == "urgent")
        by_category = {}
        for cat in ["academic", "event", "administrative", "urgent", "general"]:
            by_category[cat] = sum(1 for a in announcements if a.get("category") == cat)
        by_priority = {}
        for pri in ["low", "medium", "high", "urgent"]:
            by_priority[pri] = sum(1 for a in announcements if a.get("priority") == pri)
        return {"total": total, "unread": unread, "urgent": urgent, "by_category": by_category, "by_priority": by_priority}
