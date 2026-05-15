from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any

from api.v1.core.database import get_db
from api.v1.dependencies.auth import require_student

router = APIRouter(prefix="/student", tags=["Student"])

@router.get("/dashboard")
async def get_student_dashboard(
    current_user: Dict[str, Any] = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Get student dashboard"""
    student_id = current_user.get("id")
    
    query = text("SELECT first_name, last_name, email, registration_number FROM students WHERE id = :student_id")
    student = db.execute(query, {"student_id": student_id}).first()
    
    return {
        "success": True,
        "data": {
            "student": {
                "full_name": f"{student[0]} {student[1]}" if student else current_user.get("username"),
                "email": student[2] if student else current_user.get("email"),
                "registration_number": student[3] if student else "N/A"
            }
        }
    }

@router.get("/profile")
async def get_student_profile(
    current_user: Dict[str, Any] = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Get student profile"""
    student_id = current_user.get("id")
    
    query = text("""
        SELECT first_name, last_name, email, registration_number, year_of_study, phone, address
        FROM students WHERE id = :student_id
    """)
    student = db.execute(query, {"student_id": student_id}).first()
    
    if not student:
        raise HTTPException(404, "Student not found")
    
    return {
        "success": True,
        "profile": {
            "full_name": f"{student[0]} {student[1]}",
            "email": student[2],
            "registration_number": student[3],
            "year_of_study": student[4] or 1,
            "phone": student[5] or "Not provided",
            "address": student[6] or "Not provided"
        }
    }

@router.get("/classes")
async def get_student_classes(
    current_user: Dict[str, Any] = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Get student classes"""
    student_id = current_user.get("id")
    
    query = text("""
        SELECT c.course_code, c.course_name, c.credits
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = :student_id
    """)
    courses = db.execute(query, {"student_id": student_id}).fetchall()
    
    return {
        "success": True,
        "courses": [
            {"code": c[0], "name": c[1], "credits": c[2]}
            for c in courses
        ]
    }
