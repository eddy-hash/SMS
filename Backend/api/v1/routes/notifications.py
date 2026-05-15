from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from api.v1.core.database import get_db
from api.v1.core.dependencies import get_current_user
from api.v1.core.config import settings
import jwt
import asyncio

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"
    target_type: str = "all"
    target_id: Optional[int] = None
    expires_hours: int = 2

class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    type: Optional[str] = None
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    expires_hours: Optional[int] = None

def delete_expired_notifications(db: Session):
    from sqlalchemy import text
    result = db.execute(text("""
        DELETE FROM notifications 
        WHERE expires_at IS NOT NULL 
        AND expires_at <= NOW()
        AND is_active = 1
    """))
    db.commit()
    return result.rowcount

async def cleanup_expired_notifications():
    from api.v1.core.database import SessionLocal
    while True:
        try:
            db = SessionLocal()
            deleted = delete_expired_notifications(db)
            if deleted > 0:
                print(f"Deleted {deleted} expired notifications")
            db.close()
        except Exception as e:
            print(f"Cleanup error: {e}")
        await asyncio.sleep(3600)

@router.on_event("startup")
async def start_cleanup_task():
    asyncio.create_task(cleanup_expired_notifications())

@router.post("/create")
async def create_notification(
    notification: NotificationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    from sqlalchemy import text

    if not authorization:
        raise HTTPException(401, "Missing authorization header")
    
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_role = payload.get("role")
        user_id = payload.get("user_id") or payload.get("id")
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {str(e)}")

    # Only admins can create notifications
    if user_role != "admin":
        raise HTTPException(403, "Only administrators can create notifications")

    expires_at = datetime.now() + timedelta(hours=notification.expires_hours)

    result = db.execute(text("""
        INSERT INTO notifications (title, message, type, target_type, target_id, created_by, created_at, expires_at, is_active, is_read)
        VALUES (:title, :message, :type, :target_type, :target_id, :created_by, NOW(), :expires_at, 1, 0)
    """), {
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,
        "target_type": notification.target_type,
        "target_id": notification.target_id,
        "created_by": user_id,
        "expires_at": expires_at
    })
    db.commit()

    new_id = result.lastrowid
    background_tasks.add_task(delete_expired_notifications, db)

    return {
        "success": True,
        "notification_id": new_id,
        "message": f"Notification sent. Will expire at {expires_at.strftime('%Y-%m-%d %H:%M:%S')}",
        "expires_at": expires_at.isoformat()
    }

@router.put("/{notification_id}")
async def update_notification(
    notification_id: int,
    notification: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from sqlalchemy import text
    
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    if user_role not in ["admin", "principal"]:
        raise HTTPException(403, "Only administrators can update notifications")
    
    existing = db.execute(
        text("SELECT id FROM notifications WHERE id = :id AND is_active = 1"),
        {"id": notification_id}
    ).first()
    
    if not existing:
        raise HTTPException(404, "Notification not found")
    
    updates = []
    params = {"id": notification_id}
    
    if notification.title is not None:
        updates.append("title = :title")
        params["title"] = notification.title
    if notification.message is not None:
        updates.append("message = :message")
        params["message"] = notification.message
    if notification.type is not None:
        updates.append("type = :type")
        params["type"] = notification.type
    if notification.target_type is not None:
        updates.append("target_type = :target_type")
        params["target_type"] = notification.target_type
    if notification.target_id is not None:
        updates.append("target_id = :target_id")
        params["target_id"] = notification.target_id
    if notification.expires_hours is not None:
        new_expires = datetime.now() + timedelta(hours=notification.expires_hours)
        updates.append("expires_at = :expires_at")
        params["expires_at"] = new_expires
    
    if not updates:
        return {"success": True, "message": "No changes made"}
    
    query = f"UPDATE notifications SET {', '.join(updates)} WHERE id = :id"
    db.execute(text(query), params)
    db.commit()
    
    return {"success": True, "message": "Notification updated successfully"}

@router.get("/list")
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    include_expired: bool = Query(False),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from sqlalchemy import text
    
    user_id = current_user.get("id") if isinstance(current_user, dict) else current_user.id
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    
    query = """
        SELECT n.id, n.title, n.message, n.type, n.target_type, n.target_id, 
               n.created_by, n.created_at, n.expires_at, n.is_read, n.is_active
        FROM notifications n
        WHERE n.is_active = 1
    """
    
    if not include_expired:
        query += " AND (n.expires_at IS NULL OR n.expires_at > NOW())"
    
    query += """
        AND (n.target_type = 'all' 
             OR (n.target_type = 'students' AND :role = 'student')
             OR (n.target_type = 'staff' AND :role IN ('staff', 'teacher', 'lecturer', 'hod', 'dean', 'principal', 'admin'))
             OR (n.target_type = 'admins' AND :role IN ('admin', 'principal'))
             OR (n.target_type = 'specific_user' AND n.target_id = :user_id))
    """
    
    if unread_only:
        query += " AND n.is_read = 0"
    
    query += " ORDER BY n.created_at DESC LIMIT :limit OFFSET :skip"
    
    result = db.execute(text(query), {
        "user_id": user_id,
        "role": user_role,
        "limit": limit,
        "skip": skip
    })
    
    notifications = []
    for row in result:
        notifications.append({
            "id": row[0],
            "title": row[1],
            "message": row[2],
            "type": row[3],
            "target_type": row[4],
            "target_id": row[5],
            "created_by": row[6],
            "created_at": str(row[7]) if row[7] else None,
            "expires_at": str(row[8]) if row[8] else None,
            "is_read": bool(row[9]),
            "is_active": bool(row[10])
        })
    
    return notifications

@router.get("/{notification_id}")
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from sqlalchemy import text
    
    result = db.execute(text("""
        SELECT id, title, message, type, target_type, target_id, created_by, created_at, expires_at, is_read
        FROM notifications 
        WHERE id = :id AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())
    """), {"id": notification_id}).first()
    
    if not result:
        raise HTTPException(404, "Notification not found")
    
    return {
        "id": result[0],
        "title": result[1],
        "message": result[2],
        "type": result[3],
        "target_type": result[4],
        "target_id": result[5],
        "created_by": result[6],
        "created_at": str(result[7]) if result[7] else None,
        "expires_at": str(result[8]) if result[8] else None,
        "is_read": bool(result[9])
    }

@router.post("/{notification_id}/mark-read")
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from sqlalchemy import text
    
    result = db.execute(text("""
        UPDATE notifications 
        SET is_read = 1 
        WHERE id = :id AND is_active = 1
    """), {"id": notification_id})
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(404, "Notification not found")
    
    return {"success": True, "message": "Marked as read"}

@router.post("/{notification_id}/mark-unread")
async def mark_notification_unread(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from sqlalchemy import text
    
    result = db.execute(text("""
        UPDATE notifications 
        SET is_read = 0 
        WHERE id = :id AND is_active = 1
    """), {"id": notification_id})
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(404, "Notification not found")
    
    return {"success": True, "message": "Marked as unread"}

@router.post("/mark-all-read")
async def mark_all_read(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from sqlalchemy import text
    
    user_id = current_user.get("id") if isinstance(current_user, dict) else current_user.id
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    
    db.execute(text("""
        UPDATE notifications SET is_read = 1
        WHERE is_active = 1
        AND is_read = 0
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (target_type = 'all' 
             OR (target_type = 'students' AND :role = 'student')
             OR (target_type = 'staff' AND :role IN ('staff', 'teacher', 'lecturer', 'hod', 'dean', 'principal', 'admin'))
             OR (target_type = 'admins' AND :role IN ('admin', 'principal'))
             OR (target_type = 'specific_user' AND target_id = :user_id))
    """), {"user_id": user_id, "role": user_role})
    
    db.commit()
    return {"success": True}

@router.get("/unread-count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from sqlalchemy import text
    
    user_id = current_user.get("id") if isinstance(current_user, dict) else current_user.id
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    
    result = db.execute(text("""
        SELECT COUNT(*) FROM notifications n
        WHERE n.is_active = 1
        AND n.is_read = 0
        AND (n.expires_at IS NULL OR n.expires_at > NOW())
        AND (n.target_type = 'all' 
             OR (n.target_type = 'students' AND :role = 'student')
             OR (n.target_type = 'staff' AND :role IN ('staff', 'teacher', 'lecturer', 'hod', 'dean', 'principal', 'admin'))
             OR (n.target_type = 'admins' AND :role IN ('admin', 'principal'))
             OR (n.target_type = 'specific_user' AND n.target_id = :user_id))
    """), {"user_id": user_id, "role": user_role})
    
    count = result.scalar() or 0
    return {"unread_count": count}