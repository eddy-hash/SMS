from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from api.v1.core.database import get_db
from pydantic import BaseModel
import jwt

router = APIRouter(prefix="/announcements", tags=["Announcements"])

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: str = "general"
    priority: str = "medium"
    audience: str = "all"

@router.post("/", status_code=201)
async def create_announcement(
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db),
    request: Request = None
):
    from sqlalchemy import text
    
    # Extract user info from token
    auth_header = request.headers.get("Authorization")
    user_id = 1
    user_name = "admin"
    user_role = "admin"
    
    if auth_header and auth_header.startswith("Bearer "):
        try:
            token = auth_header.replace("Bearer ", "")
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = int(payload.get("sub", 1))
            user_name = payload.get("username", "admin")
            user_role = payload.get("role", "admin")
        except Exception as e:
            print(f"Token decode error: {e}")
    
    print(f"Creating announcement for user: {user_id} ({user_name})")
    
    # Use dictionary parameters (named placeholders with colon)
    query = text("""
        INSERT INTO announcements (title, content, category, priority, audience, author_id, author_name, author_role)
        VALUES (:title, :content, :category, :priority, :audience, :author_id, :author_name, :author_role)
    """)
    
    params = {
        "title": announcement.title,
        "content": announcement.content,
        "category": announcement.category,
        "priority": announcement.priority,
        "audience": announcement.audience,
        "author_id": user_id,
        "author_name": user_name,
        "author_role": user_role
    }
    
    try:
        # Execute with dictionary parameters
        db.execute(query, params)
        db.commit()
        
        # Get the last inserted ID
        result = db.execute(text("SELECT LAST_INSERT_ID() as id"))
        row = result.first()
        announcement_id = row[0] if row else None
        
        print(f"Inserted announcement with ID: {announcement_id}")
        
        if announcement_id:
            # Fetch the created announcement
            select_query = text("SELECT * FROM announcements WHERE id = :id")
            new_ann = db.execute(select_query, {"id": announcement_id}).first()
            
            if new_ann:
                return {
                    "id": new_ann[0],
                    "title": new_ann[1],
                    "content": new_ann[2],
                    "category": new_ann[3],
                    "priority": new_ann[4],
                    "audience": new_ann[5],
                    "author_id": new_ann[6],
                    "author_name": new_ann[7],
                    "author_role": new_ann[8],
                    "attachments": new_ann[9],
                    "is_active": new_ann[10],
                    "is_pinned": new_ann[11],
                    "created_at": str(new_ann[12]),
                    "updated_at": str(new_ann[13]) if new_ann[13] else None,
                    "published_at": str(new_ann[14]),
                    "expiry_date": str(new_ann[15]) if new_ann[15] else None,
                    "views": new_ann[16],
                    "is_read": True
                }
        
        raise HTTPException(status_code=500, detail="Failed to get inserted ID")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/")
async def get_announcements(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    request: Request = None
):
    from sqlalchemy import text
    
    # Get user role from token
    auth_header = request.headers.get("Authorization")
    user_role = "student"
    
    if auth_header and auth_header.startswith("Bearer "):
        try:
            token = auth_header.replace("Bearer ", "")
            payload = jwt.decode(token, options={"verify_signature": False})
            user_role = payload.get("role", "student")
        except:
            pass
    
    query = "SELECT * FROM announcements WHERE is_active = 1"
    
    if user_role == "student":
        query += " AND audience IN ('all', 'students')"
    elif user_role == "teacher":
        query += " AND audience IN ('all', 'teachers')"
    elif user_role == "staff":
        query += " AND audience IN ('all', 'staff')"
    
    query += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    
    result = db.execute(text(query), {"limit": limit, "skip": skip})
    announcements = []
    
    for row in result:
        announcements.append({
            "id": row[0],
            "title": row[1],
            "content": row[2],
            "category": row[3],
            "priority": row[4],
            "audience": row[5],
            "author_id": row[6],
            "author_name": row[7],
            "author_role": row[8],
            "attachments": row[9],
            "is_active": row[10],
            "is_pinned": row[11],
            "created_at": str(row[12]),
            "updated_at": str(row[13]) if row[13] else None,
            "published_at": str(row[14]),
            "expiry_date": str(row[15]) if row[15] else None,
            "views": row[16],
            "is_read": False
        })
    
    return announcements

@router.get("/stats")
async def get_stats(
    db: Session = Depends(get_db)
):
    from sqlalchemy import text
    
    result = db.execute(text("SELECT COUNT(*) FROM announcements WHERE is_active = 1"))
    total = result.first()[0]
    
    result = db.execute(text("SELECT COUNT(*) FROM announcements WHERE priority = 'urgent' AND is_active = 1"))
    urgent = result.first()[0]
    
    return {
        "total": total,
        "unread": 0,
        "urgent": urgent,
        "by_category": {},
        "by_priority": {}
    }

@router.get("/my-announcements")
async def get_my_announcements(
    db: Session = Depends(get_db),
    request: Request = None
):
    from sqlalchemy import text
    
    # Get user ID from token
    auth_header = request.headers.get("Authorization")
    user_id = 1
    
    if auth_header and auth_header.startswith("Bearer "):
        try:
            token = auth_header.replace("Bearer ", "")
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = int(payload.get("sub", 1))
        except:
            pass
    
    result = db.execute(text("SELECT * FROM announcements WHERE author_id = :uid ORDER BY created_at DESC"), {"uid": user_id})
    announcements = []
    
    for row in result:
        announcements.append({
            "id": row[0],
            "title": row[1],
            "content": row[2],
            "category": row[3],
            "priority": row[4],
            "audience": row[5],
            "author_id": row[6],
            "author_name": row[7],
            "author_role": row[8],
            "created_at": str(row[12]),
            "is_read": True
        })
    
    return announcements

@router.post("/{announcement_id}/mark-read")
async def mark_as_read(
    announcement_id: int,
    db: Session = Depends(get_db),
    request: Request = None
):
    from sqlalchemy import text
    
    # Get user ID from token
    auth_header = request.headers.get("Authorization")
    user_id = 1
    
    if auth_header and auth_header.startswith("Bearer "):
        try:
            token = auth_header.replace("Bearer ", "")
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = int(payload.get("sub", 1))
        except:
            pass
    
    # Check if already marked
    check = db.execute(text("SELECT id FROM announcement_read_receipts WHERE announcement_id = :aid AND user_id = :uid"), 
                      {"aid": announcement_id, "uid": user_id})
    
    if not check.first():
        db.execute(text("INSERT INTO announcement_read_receipts (announcement_id, user_id) VALUES (:aid, :uid)"),
                  {"aid": announcement_id, "uid": user_id})
        db.commit()
    
    return {"success": True}

@router.delete("/{announcement_id}", status_code=204)
async def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    request: Request = None
):
    from sqlalchemy import text
    
    # Get user info from token
    auth_header = request.headers.get("Authorization")
    user_id = 1
    user_role = "admin"
    
    if auth_header and auth_header.startswith("Bearer "):
        try:
            token = auth_header.replace("Bearer ", "")
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = int(payload.get("sub", 1))
            user_role = payload.get("role", "admin")
        except Exception as e:
            print(f"Token decode error: {e}")
    
    # Check if announcement exists
    check_query = text("SELECT author_id FROM announcements WHERE id = :id AND is_active = 1")
    result = db.execute(check_query, {"id": announcement_id})
    announcement = result.first()
    
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Check permission (only author or admin can delete)
    if announcement[0] != user_id and user_role != "admin":
        raise HTTPException(status_code=403, detail="You don't have permission to delete this announcement")
    
    # Soft delete
    delete_query = text("UPDATE announcements SET is_active = 0 WHERE id = :id")
    db.execute(delete_query, {"id": announcement_id})
    db.commit()
    
    return None

@router.put("/{announcement_id}")
async def update_announcement(
    announcement_id: int,
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db),
    request: Request = None
):
    from sqlalchemy import text
    
    # Get user info from token
    auth_header = request.headers.get("Authorization")
    user_id = 1
    user_role = "admin"
    
    if auth_header and auth_header.startswith("Bearer "):
        try:
            token = auth_header.replace("Bearer ", "")
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = int(payload.get("sub", 1))
            user_role = payload.get("role", "admin")
        except Exception as e:
            print(f"Token decode error: {e}")
    
    # Check if announcement exists
    check_query = text("SELECT author_id FROM announcements WHERE id = :id AND is_active = 1")
    result = db.execute(check_query, {"id": announcement_id})
    existing = result.first()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Check permission (only author or admin can update)
    if existing[0] != user_id and user_role != "admin":
        raise HTTPException(status_code=403, detail="You don't have permission to update this announcement")
    
    # Update announcement
    update_query = text("""
        UPDATE announcements 
        SET title = :title, 
            content = :content, 
            category = :category, 
            priority = :priority, 
            audience = :audience,
            updated_at = NOW()
        WHERE id = :id
    """)
    
    params = {
        "title": announcement.title,
        "content": announcement.content,
        "category": announcement.category,
        "priority": announcement.priority,
        "audience": announcement.audience,
        "id": announcement_id
    }
    
    db.execute(update_query, params)
    db.commit()
    
    # Get updated announcement
    select_query = text("SELECT * FROM announcements WHERE id = :id")
    result = db.execute(select_query, {"id": announcement_id})
    updated = result.first()
    
    if updated:
        return {
            "id": updated[0],
            "title": updated[1],
            "content": updated[2],
            "category": updated[3],
            "priority": updated[4],
            "audience": updated[5],
            "author_id": updated[6],
            "author_name": updated[7],
            "author_role": updated[8],
            "attachments": updated[9],
            "is_active": updated[10],
            "is_pinned": updated[11],
            "created_at": str(updated[12]),
            "updated_at": str(updated[13]) if updated[13] else None,
            "published_at": str(updated[14]),
            "expiry_date": str(updated[15]) if updated[15] else None,
            "views": updated[16],
            "is_read": True
        }
    
    raise HTTPException(status_code=500, detail="Failed to retrieve updated announcement")
