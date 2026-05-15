from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from api.v1.dependencies.database import get_db
from api.v1.dependencies.auth import get_current_user
from models.user import User

router = APIRouter(tags=["Users"])

@router.get("/users")
async def get_users(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get all users"""
    try:
        # Only admins can see all users
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admins can view all users")
        
        users = db.query(User).all()
        return {
            "users": [
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "full_name": u.full_name,
                    "role": u.role
                } for u in users
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get specific user"""
    try:
        # Users can view their own profile, admins can view any
        if current_user.get("id") != user_id and current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "profile_image": getattr(user, 'profile_image', None)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
