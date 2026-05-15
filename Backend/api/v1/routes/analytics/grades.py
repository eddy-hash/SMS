from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import jwt
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(tags=["Analytics Grades"])

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/grades/distribution")
async def get_grade_distribution(course_id: Optional[int] = None, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    return {"distribution": {"A": 180, "B": 420, "C": 380, "D": 150, "F": 70}, "percentages": {"A": 15.0, "B": 35.0, "C": 31.7, "D": 12.5, "F": 5.8}, "total_grades": 1200, "average_score": 72.5}
