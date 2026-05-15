from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Dict, Any
import jwt
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(tags=["Analytics Trends"])

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/trends/enrollment")
async def get_enrollment_trends(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    return {"trends": [{"year": 2020, "students": 980, "staff": 180, "courses": 62}, {"year": 2021, "students": 1050, "staff": 195, "courses": 68}, {"year": 2022, "students": 1120, "staff": 210, "courses": 74}, {"year": 2023, "students": 1185, "staff": 228, "courses": 80}, {"year": 2024, "students": 1250, "staff": 245, "courses": 86}], "projections": []}

@router.get("/trends/performance")
async def get_performance_trends(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    return {"trends": [{"year": 2020, "graduationRate": 72.5, "employmentRate": 75.2, "retentionRate": 78.5}, {"year": 2021, "graduationRate": 74.2, "employmentRate": 77.8, "retentionRate": 80.2}, {"year": 2022, "graduationRate": 76.8, "employmentRate": 79.5, "retentionRate": 82.5}, {"year": 2023, "graduationRate": 77.5, "employmentRate": 81.2, "retentionRate": 84.0}, {"year": 2024, "graduationRate": 78.5, "employmentRate": 82.3, "retentionRate": 85.2}]}

@router.get("/trends/research")
async def get_research_trends(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    return {"trends": [{"year": 2020, "publications": 85, "grants": 12, "funding": 1200000}, {"year": 2021, "publications": 98, "grants": 15, "funding": 1500000}, {"year": 2022, "publications": 112, "grants": 18, "funding": 1800000}, {"year": 2023, "publications": 135, "grants": 22, "funding": 2200000}, {"year": 2024, "publications": 156, "grants": 25, "funding": 2500000}]}
