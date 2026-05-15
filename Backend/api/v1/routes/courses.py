from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Optional
from pydantic import BaseModel
import jwt
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(tags=["Courses"])

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

class CourseCreate(BaseModel):
    course_code: str
    course_name: str
    credits: Optional[int] = 3

class CourseUpdate(BaseModel):
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    credits: Optional[int] = None

@router.get("/courses/list")
async def get_courses_list(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    """Get courses list - for dropdown/table display"""
    try:
        result = db.execute(text("""
            SELECT id, course_code, course_name, credits, department_id 
            FROM courses 
            ORDER BY course_name
        """))
        
        courses = []
        for row in result:
            courses.append({
                "id": row[0],
                "course_code": row[1],
                "course_name": row[2],
                "credits": row[3] or 3,
                "department_id": row[4]
            })
        
        return courses
    except Exception as e:
        print(f"Get courses list error: {e}")
        return []

@router.post("/courses/create")
async def create_course(course: CourseCreate, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    """Create a new course"""
    try:
        # Check if course code already exists
        existing = db.execute(text("SELECT id FROM courses WHERE course_code = :code"), {"code": course.course_code}).first()
        if existing:
            raise HTTPException(status_code=400, detail="Course code already exists")
        
        # Check if course name already exists
        existing = db.execute(text("SELECT id FROM courses WHERE course_name = :name"), {"name": course.course_name}).first()
        if existing:
            raise HTTPException(status_code=400, detail="Course name already exists")
        
        result = db.execute(text("""
            INSERT INTO courses (course_code, course_name, credits)
            VALUES (:code, :name, :credits)
        """), {
            "code": course.course_code,
            "name": course.course_name,
            "credits": course.credits or 3
        })
        db.commit()
        
        return {
            "success": True, 
            "message": "Course created successfully", 
            "course_id": result.lastrowid,
            "course": {
                "id": result.lastrowid,
                "course_code": course.course_code,
                "course_name": course.course_name,
                "credits": course.credits or 3
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Create course error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/courses/{course_id}")
async def update_course(course_id: int, course: CourseUpdate, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    """Update a course"""
    try:
        # Check if course exists
        result = db.execute(text("SELECT id FROM courses WHERE id = :id"), {"id": course_id})
        if not result.first():
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Build update query dynamically
        updates = []
        params = {"id": course_id}
        
        if course.course_code is not None:
            # Check if new code already exists
            existing = db.execute(text("SELECT id FROM courses WHERE course_code = :code AND id != :id"), 
                                 {"code": course.course_code, "id": course_id}).first()
            if existing:
                raise HTTPException(status_code=400, detail="Course code already exists")
            updates.append("course_code = :course_code")
            params["course_code"] = course.course_code
        
        if course.course_name is not None:
            # Check if new name already exists
            existing = db.execute(text("SELECT id FROM courses WHERE course_name = :name AND id != :id"), 
                                 {"name": course.course_name, "id": course_id}).first()
            if existing:
                raise HTTPException(status_code=400, detail="Course name already exists")
            updates.append("course_name = :course_name")
            params["course_name"] = course.course_name
        
        if course.credits is not None:
            updates.append("credits = :credits")
            params["credits"] = course.credits
        
        if updates:
            query = text(f"UPDATE courses SET {', '.join(updates)} WHERE id = :id")
            db.execute(query, params)
            db.commit()
        
        return {"success": True, "message": "Course updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Update course error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/courses/{course_id}")
async def delete_course(course_id: int, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    """Delete a course"""
    try:
        # Check if course exists
        result = db.execute(text("SELECT id, course_name FROM courses WHERE id = :id"), {"id": course_id})
        row = result.first()
        if not row:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if course has any enrolled students
        enrollments = db.execute(text("SELECT COUNT(*) FROM enrollments WHERE course_id = :id"), {"id": course_id}).scalar()
        if enrollments > 0:
            raise HTTPException(status_code=400, detail=f"Cannot delete course with {enrollments} enrolled students")
        
        db.execute(text("DELETE FROM courses WHERE id = :id"), {"id": course_id})
        db.commit()
        
        return {"success": True, "message": f"Course '{row[1]}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Delete course error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/courses/{course_id}")
async def get_course(course_id: int, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    """Get a specific course"""
    try:
        result = db.execute(text("""
            SELECT id, course_code, course_name, credits, department_id 
            FROM courses 
            WHERE id = :course_id
        """), {"course_id": course_id})
        
        row = result.first()
        if not row:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return {
            "id": row[0],
            "course_code": row[1],
            "course_name": row[2],
            "credits": row[3] or 3,
            "department_id": row[4]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get course error: {e}")
        raise HTTPException(status_code=500, detail=str(e))