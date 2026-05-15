from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from api.v1.dependencies.database import get_db
from api.v1.dependencies.auth import get_current_user

router = APIRouter(tags=["Analytics Courses"])

@router.get("/courses/popular")
async def get_popular_courses(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get most popular courses"""
    try:
        return {
            "courses": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/courses/completion-rates")
async def get_completion_rates(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get course completion rates"""
    try:
        return {
            "courses": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
