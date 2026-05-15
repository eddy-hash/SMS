from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text
import jwt
from typing import Dict, List

from api.v1.core.database import get_db
from api.v1.core.config import settings

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Dict:
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("user_id") or payload.get("sub")
        role = payload.get("role")
        if not user_id or not role:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        if role == "admin":
            query = text("SELECT id, username, email, full_name FROM admin WHERE id = :id")
            user = db.execute(query, {"id": user_id}).first()
            if not user:
                raise HTTPException(status_code=401, detail="Admin not found")
            return {
                "id": user[0],
                "username": user[1],
                "email": user[2],
                "full_name": user[3],
                "role": "admin"
            }
        elif role == "student":
            query = text("""
                SELECT id, email, CONCAT(first_name, ' ', last_name) as full_name 
                FROM students WHERE id = :id
            """)
            user = db.execute(query, {"id": user_id}).first()
            if not user:
                raise HTTPException(status_code=401, detail="Student not found")
            return {
                "id": user[0],
                "email": user[1],
                "full_name": user[2],
                "role": "student"
            }
        else:
            raise HTTPException(status_code=401, detail=f"Unknown role: {role}")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Auth failed")

def require_role(allowed_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

def require_admin(current_user: dict = Depends(require_role(["admin"]))):
    return current_user

def require_principal(current_user: dict = Depends(require_role(["admin", "principal"]))):
    return current_user

def require_hod(current_user: dict = Depends(require_role(["admin", "principal", "hod"]))):
    return current_user

def require_teacher(current_user: dict = Depends(require_role(["admin", "principal", "hod", "teacher", "lecturer"]))):
    return current_user

def require_staff(current_user: dict = Depends(require_role(["admin", "principal", "hod", "staff"]))):
    return current_user

def require_student(current_user: dict = Depends(require_role(["admin", "teacher", "student"]))):
    return current_user

def require_any_authenticated(current_user: dict = Depends(get_current_user)):
    return current_user