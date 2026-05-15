from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import jwt
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(tags=["Analytics Attendance"])

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/attendance/overview")
async def get_attendance_overview(start_date: Optional[str] = None, end_date: Optional[str] = None, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    return {"overall_rate": 94.5, "total_classes": 120, "present_count": 1134, "absent_count": 66, "daily_trends": [{"date": "2024-01-01", "rate": 95}, {"date": "2024-01-02", "rate": 93}, {"date": "2024-01-03", "rate": 96}, {"date": "2024-01-04", "rate": 94}, {"date": "2024-01-05", "rate": 92}]}
