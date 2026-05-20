from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
from pydantic import BaseModel
from passlib.context import CryptContext

from api.v1.core.database import get_db
from api.v1.dependencies.auth import get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

@router.put("/teacher/password/change-password")
async def change_teacher_password(
    password_data: PasswordChangeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print("=" * 60)
    print("✅ TEACHER PASSWORD CHANGE - USING BCRYPT ✅")
    print(f"User role: {current_user.get('role')}")
    print(f"User ID: {current_user.get('id')}")
    print("=" * 60)
    
    # Verify teacher role
    if current_user.get("role") != "teacher":
        raise HTTPException(403, f"Only teachers can change password. Your role: {current_user.get('role')}")
    
    teacher_id = current_user.get("id")
    if not teacher_id:
        raise HTTPException(400, "Teacher ID not found")
    
    # Get current password from database
    query = text("SELECT password FROM teachers WHERE id = :id AND is_active = 1")
    teacher = db.execute(query, {"id": teacher_id}).first()
    
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    
    stored_hash = teacher[0]
    print(f"Stored hash: {stored_hash[:30]}...")
    
    # Verify current password using bcrypt
    if not pwd_context.verify(password_data.current_password, stored_hash):
        print("Password verification FAILED")
        raise HTTPException(401, "Current password is incorrect")
    
    print("Password verification SUCCESS")
    
    # Hash new password using bcrypt
    new_hashed = pwd_context.hash(password_data.new_password)
    
    # Update password
    update_query = text("UPDATE teachers SET password = :password, updated_at = :updated_at WHERE id = :id")
    db.execute(update_query, {
        "password": new_hashed,
        "updated_at": datetime.now(),
        "id": teacher_id
    })
    db.commit()
    
    return {
        "success": True,
        "message": "Password changed successfully"
    }
