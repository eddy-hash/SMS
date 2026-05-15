from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any
import sys
import os
import jwt

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def get_current_user_from_token(authorization: str = Header(None)):
    """Extract user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
    
@router.get("/counts")
async def get_counts(db: Session = Depends(get_db), current_user = Depends(get_current_user_from_token)):
    students = db.execute(text("SELECT COUNT(*) FROM students WHERE is_active = 1")).scalar() or 0
    staff = db.execute(text("SELECT COUNT(*) FROM staff WHERE is_active = 1")).scalar() or 0
    courses = db.execute(text("SELECT COUNT(*) FROM courses")).scalar() or 0
    return {"students": students, "staff": staff, "courses": courses}

@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Get dashboard statistics using raw SQL"""
    try:
        
        result = db.execute(text("SELECT COUNT(*) FROM students"))
        total_students = result.scalar() or 0
        
        result = db.execute(text("SELECT COUNT(*) FROM staff"))
        total_staff = result.scalar() or 0
        
        result = db.execute(text("SELECT COUNT(*) FROM courses"))
        total_courses = result.scalar() or 0
        
        result = db.execute(text("SELECT COUNT(*) FROM departments"))
        total_departments = result.scalar() or 0
        
        return {
            "totalStudents": total_students,
            "totalStaff": total_staff,
            "totalCourses": total_courses,
            "totalDepartments": total_departments,
            "graduationRate": 92,
            "employmentRate": 88,
            "internationalStudents": 15,
            "researchProjects": 45
        }
    except Exception as e:
        print(f"Dashboard stats error: {e}")
        return {
            "totalStudents": 0,
            "totalStaff": 0,
            "totalCourses": 0,
            "totalDepartments": 0,
            "graduationRate": 0,
            "employmentRate": 0,
            "internationalStudents": 0,
            "researchProjects": 0
        }
