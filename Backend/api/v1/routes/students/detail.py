from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Optional
import jwt
import sys
import os
import math

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(tags=["Student Detail"])

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/{student_id}")
async def get_student(student_id: int, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    result = db.execute(text("""SELECT s.id, s.first_name, s.last_name, s.email, s.phone, s.registration_number, s.course_id, s.year_of_study, s.status, s.address, s.guardian_name, s.guardian_phone, c.name as course_name FROM students s LEFT JOIN courses c ON s.course_id = c.id WHERE s.id = :student_id"""), {"student_id": student_id})
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"id": row[0], "first_name": row[1], "last_name": row[2], "full_name": f"{row[1]} {row[2]}".strip(), "email": row[3], "phone": str(row[4]) if row[4] else None, "registration_number": row[5], "course_id": row[6], "course_name": row[12] if len(row) > 12 else None, "year_of_study": row[7], "status": row[8], "address": row[9], "guardian_name": row[10], "guardian_phone": row[11]}

@router.get("/list")
async def get_students_list(
    page: int = Query(1, ge=1), 
    per_page: int = Query(10, ge=1, le=100), 
    search: Optional[str] = Query(None), 
    db: Session = Depends(get_db), 
    current_user: Dict = Depends(verify_token)
):
    offset = (page - 1) * per_page
    search_condition = ""
    params = {}
    
    if search and search.strip():
        search_term = f"%{search.strip()}%"
        search_condition = "WHERE s.first_name LIKE :search OR s.last_name LIKE :search OR s.email LIKE :search OR s.registration_number LIKE :search"
        params["search"] = search_term
    
    total_result = db.execute(text(f"SELECT COUNT(*) FROM students s {search_condition}"), params)
    total = total_result.scalar() or 0
    total_pages = math.ceil(total / per_page) if total > 0 else 1
    
    query = f"""
        SELECT s.id, s.registration_number, 
               CONCAT(s.first_name, ' ', s.last_name) as full_name,
               s.email, s.phone, s.year_of_study, s.status,
               s.department_id, d.department_name,
               s.course_id, c.course_name
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        LEFT JOIN courses c ON s.course_id = c.id
        {search_condition}
        ORDER BY s.first_name, s.last_name
        LIMIT :limit OFFSET :offset
    """
    params["limit"] = per_page
    params["offset"] = offset
    
    result = db.execute(text(query), params)
    
    students = []
    for row in result:
        students.append({
            "id": row[0],
            "registration_number": row[1],
            "full_name": row[2],
            "email": row[3],
            "phone": row[4],
            "year_of_study": row[5],
            "status": row[6],
            "department_id": row[7],
            "department_name": row[8],
            "course_id": row[9],
            "course_name": row[10] if row[10] else "No Course"
        })
    
    return {
        "data": students,
        "pagination": {
            "current_page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }
