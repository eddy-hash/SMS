from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import jwt
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(tags=["Analytics Performance"])

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/performance/grade-distribution")
async def get_grade_distribution(course_id: Optional[int] = None, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    return {"distribution": {"A": 180, "B": 420, "C": 380, "D": 150, "F": 70}, "percentages": {"A": 15.0, "B": 35.0, "C": 31.7, "D": 12.5, "F": 5.8}, "total": 1200, "averageScore": 72.5}

@router.get("/performance/faculty-metrics")
async def get_faculty_metrics(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    return {"metrics": {"totalFaculty": 245, "phdPercentage": 68.5, "avgTeachingExperience": 8.5, "publicationsPerFaculty": 2.8, "studentFeedbackScore": 4.2}, "topPerformers": []}

@router.get("/performance/student-success")
async def get_student_success_metrics(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    return {"metrics": {"graduationRate": 78.5, "employmentRate": 82.3, "retentionRate": 85.2, "averageTimeToDegree": 4.2, "internshipPlacement": 68.5}, "byCohort": []}
