from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Dict, Any, Optional
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from api.v1.dependencies.database import get_db
from api.v1.dependencies.auth import get_current_user
from models.user import User

router = APIRouter(tags=["Analytics Students"])

@router.get("/students/enrollment-trends")
async def get_enrollment_trends(
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get student enrollment trends"""
    try:
        if not year:
            year = datetime.now().year
        
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Get students created by month
        students_by_month = db.query(
            extract('month', User.created_at).label('month'),
            func.count(User.id).label('count')
        ).filter(
            User.role == 'student',
            extract('year', User.created_at) == year
        ).group_by('month').all()
        
        enrollment_data = []
        for month in range(1, 13):
            count = next((s[1] for s in students_by_month if s[0] == month), 0)
            enrollment_data.append({
                "month": months[month-1],
                "students": count
            })
        
        return {
            "year": year,
            "data": enrollment_data,
            "total": sum(e[1] for e in students_by_month)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/students/distribution")
async def get_student_distribution(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get student distribution"""
    try:
        # Get students by role
        total_students = db.query(User).filter(User.role == "student").count()
        
        return {
            "byDepartment": [],
            "byYear": [],
            "byGender": [],
            "totalStudents": total_students
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
