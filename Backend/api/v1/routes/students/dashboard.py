from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from api.v1.core.database import get_db
from api.v1.dependencies.auth import require_student

router = APIRouter()

@router.get("/dashboard")
async def get_student_dashboard(
    current_user: Dict[str, Any] = Depends(require_student),
    db: Session = Depends(get_db)
):
    student_id = current_user.get("id")
    if not student_id:
        return {"success": False, "error": "No student ID found"}
    
    query = text("""
        SELECT first_name, last_name, email, registration_number, year_of_study
        FROM students WHERE id = :student_id
    """)
    student = db.execute(query, {"student_id": student_id}).first()
    if not student:
        return {"success": False, "error": "Student not found"}
    
    return {
        "success": True,
        "data": {
            "student": {
                "full_name": f"{student[0]} {student[1]}",
                "email": student[2],
                "registration_number": student[3],
                "year_of_study": student[4] or 1
            }
        },
        "message": f"Welcome back, {student[0]}!"
    }

@router.get("/profile")
async def get_student_profile(
    current_user: Dict[str, Any] = Depends(require_student),
    db: Session = Depends(get_db)
):
    student_id = current_user.get("id")
    if not student_id:
        raise HTTPException(400, "Student ID not found")
    
    query = text("""
        SELECT 
            first_name, last_name, email, registration_number, 
            year_of_study, phone, address, guardian_name, guardian_phone,
            gender, date_of_birth
        FROM students 
        WHERE id = :student_id
    """)
    student = db.execute(query, {"student_id": student_id}).first()
    if not student:
        raise HTTPException(404, "Student not found")
    
    return {
        "success": True,
        "profile": {
            "first_name": student[0],
            "last_name": student[1],
            "full_name": f"{student[0]} {student[1]}",
            "email": student[2],
            "registration_number": student[3],
            "year_of_study": student[4] or 1,
            "phone": student[5] or "Not provided",
            "address": student[6] or "Not provided",
            "guardian_name": student[7] or "Not provided",
            "guardian_phone": student[8] or "Not provided",
            "gender": student[9] or "Not specified",
            "date_of_birth": str(student[10]) if student[10] else None
        }
    }

@router.get("/classes")
async def get_student_classes(
    current_user: Dict[str, Any] = Depends(require_student),
    db: Session = Depends(get_db)
):
    student_id = current_user.get("id")
    if not student_id:
        raise HTTPException(400, "Student ID not found")
    
    query = text("""
        SELECT c.id, c.course_code, c.course_name, c.credits, d.department_name
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN departments d ON c.department_id = d.id
        WHERE s.id = :student_id AND c.id IS NOT NULL
    """)
    course_row = db.execute(query, {"student_id": student_id}).first()
    if not course_row:
        return {"success": True, "courses": []}
    
    course = {
        "id": course_row[0],
        "code": course_row[1],
        "name": course_row[2],
        "credits": course_row[3],
        "department": course_row[4] or "General"
    }
    return {
        "success": True,
        "courses": [course],
        "count": 1
    }
