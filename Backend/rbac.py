from fastapi import Depends, HTTPException, status
from fastapi import Request
from sqlalchemy.orm import Session
from sqlalchemy import text
import jwt
from typing import List, Optional

from api.v1.core.config import settings
from api.v1.core.database import get_db

class Roles:
    STUDENT = "student"
    TEACHER = "teacher"
    LECTURER = "lecturer"
    HOD = "hod"
    DEAN = "dean"
    PRINCIPAL = "principal"
    ADMIN = "admin"
    STAFF = "staff"

ROLE_HIERARCHY = {
    Roles.STUDENT: 1,
    Roles.TEACHER: 2,
    Roles.LECTURER: 3,
    Roles.STAFF: 3,
    Roles.HOD: 4,
    Roles.DEAN: 5,
    Roles.PRINCIPAL: 6,
    Roles.ADMIN: 7,
}

def get_current_user(request: Request, db: Session = Depends(get_db)) -> dict:
    """Get current user from JWT token"""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        user_id = payload.get("user_id")
        if not user_id:
            user_id = payload.get("sub")
        
        query = text("""
            SELECT id, username, email, full_name, role, is_active
            FROM admin
            WHERE id = :id
        """)
        result = db.execute(query, {"id": user_id})
        user = result.first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if not user[5]: 
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is disabled"
            )
        
        return {
            "id": user[0],
            "username": user[1],
            "email": user[2],
            "full_name": user[3],
            "role": user[4] or Roles.STUDENT,
            "is_active": user[5]
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

def require_role(required_roles: List[str]):
    """Dependency factory for role requirements"""
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", Roles.STUDENT)
        
        if user_role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(required_roles)}. Your role: {user_role}"
            )
        return current_user
    return role_checker

def require_minimum_role(min_role: str):
    """Require minimum role level (higher or equal)"""
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", Roles.STUDENT)
        user_level = ROLE_HIERARCHY.get(user_role, 0)
        required_level = ROLE_HIERARCHY.get(min_role, 0)
        
        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required minimum role: {min_role}. Your role: {user_role}"
            )
        return current_user
    return role_checker

require_admin = require_role([Roles.ADMIN])
require_principal = require_role([Roles.PRINCIPAL, Roles.ADMIN])
require_principal_admin = require_role([Roles.PRINCIPAL, Roles.ADMIN])
require_dean = require_role([Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN])
require_hod = require_role([Roles.HOD, Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN])
require_teacher = require_role([Roles.TEACHER, Roles.LECTURER, Roles.HOD, Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN])
require_student = require_role([Roles.STUDENT, Roles.TEACHER, Roles.LECTURER, Roles.HOD, Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN])
require_any_authenticated = require_role([Roles.STUDENT, Roles.TEACHER, Roles.LECTURER, Roles.HOD, Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN, Roles.STAFF])