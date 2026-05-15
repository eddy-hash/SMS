from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Dict, Any
import jwt
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(tags=["Analytics Overview"])

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/overview/key-metrics")
async def get_key_metrics(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    return {"academic": {"passRate": 85.6, "distinctionRate": 12.3, "dropoutRate": 5.2}, "financial": {"budgetUtilization": 78.5, "scholarshipCoverage": 23.4, "researchFunding": 2450000}, "studentLife": {"clubParticipation": 45.2, "sportsParticipation": 32.8, "satisfactionIndex": 4.1}}

@router.get("/overview/recent-activities")
async def get_recent_activities(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    return {"activities": [{"id": 1, "action": "New student registration", "user": "John Doe", "timestamp": datetime.now().isoformat(), "type": "registration"}]}

@router.get("/overview/alerts")
async def get_alerts(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    return {"alerts": []}
