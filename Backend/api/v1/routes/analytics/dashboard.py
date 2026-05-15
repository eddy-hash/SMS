from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from api.v1.dependencies.database import get_db
from api.v1.dependencies.auth import get_current_user
from models.user import User

router = APIRouter(tags=["Analytics Dashboard"])

@router.get("/stats")
async def get_analytics_stats(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get main analytics statistics"""
    try:
        total_students = db.query(User).filter(User.role == "student").count()
        total_staff = db.query(User).filter(User.role == "staff").count()
        total_admins = db.query(User).filter(User.role == "admin").count()
        
        return {
            "totalStudents": total_students,
            "totalStaff": total_staff,
            "totalAdmins": total_admins,
            "totalUsers": db.query(User).count(),
            "graduationRate": 92,
            "employmentRate": 88,
            "internationalStudents": 15,
            "researchProjects": 45
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
