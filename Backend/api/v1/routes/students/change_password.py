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

@router.put("/students/password/change-password")
async def change_student_password(
    password_data: PasswordChangeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print("=" * 60)
    print("✅ STUDENT PASSWORD CHANGE - USING BCRYPT ✅")
    print(f"User role: {current_user.get('role')}")
    print(f"User ID: {current_user.get('id')}")
    print("=" * 60)
    
    # Verify student role
    if current_user.get("role") != "student":
        raise HTTPException(403, f"Only students can change password. Your role: {current_user.get('role')}")
    
    student_id = current_user.get("id")
    if not student_id:
        raise HTTPException(400, "Student ID not found")
    
    # Get current password from database
    query = text("SELECT password FROM students WHERE id = :id AND status = 'active'")
    student = db.execute(query, {"id": student_id}).first()
    
    if not student:
        raise HTTPException(404, "Student not found")
    
    stored_hash = student[0]
    print(f"Stored hash: {stored_hash[:30]}..." if stored_hash else "No hash found")
    
    # Verify current password using bcrypt
    if not pwd_context.verify(password_data.current_password, stored_hash):
        print("Password verification FAILED")
        raise HTTPException(401, "Current password is incorrect")
    
    print("Password verification SUCCESS")
    
    # Hash new password using bcrypt
    new_hashed = pwd_context.hash(password_data.new_password)
    
    # Update password
    update_query = text("UPDATE students SET password = :password, updated_at = :updated_at WHERE id = :id")
    db.execute(update_query, {
        "password": new_hashed,
        "updated_at": datetime.now(),
        "id": student_id
    })
    db.commit()
    
    return {
        "success": True,
        "message": "Password changed successfully"
    }