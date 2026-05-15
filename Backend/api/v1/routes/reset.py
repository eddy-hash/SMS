# api/v1/routes/reset.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Optional
import secrets
import string
import random
from datetime import datetime, timedelta

from api.v1.dependencies.database import get_db
from api.v1.core.config import settings
from api.v1.dependencies.auth import get_current_user, get_password_hash, verify_password, require_admin

router = APIRouter(tags=["Password Reset"])

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

def generate_random_password(length: int = 10) -> str:
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(random.choice(characters) for _ in range(length))
    return password

def send_reset_email(email: str, reset_link: str) -> None:
    print(f"Sending reset email to {email}")
    print(f"Reset link: {reset_link}")

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user_query = text("""
        SELECT u.id, r.name as role_name, u.email
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = :email
    """)
    user = db.execute(user_query, {"email": request.email}).first()
    
    if not user:
        return {"message": "If your email is registered, you will receive reset instructions"}
    
    user_id = user[0]
    role_name = user[1]
    
    if role_name == "admin":
        return {"message": "Admin password reset must be done by system administrator"}
    
    db.execute(text("DELETE FROM password_reset_tokens WHERE user_id = :user_id"), {"user_id": user_id})
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    db.execute(text("""
        INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
        VALUES (:user_id, :token, :expires_at, :created_at)
    """), {
        "user_id": user_id,
        "token": token,
        "expires_at": expires_at,
        "created_at": datetime.utcnow()
    })
    db.commit()
    
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    background_tasks.add_task(send_reset_email, user[2], reset_link)
    
    return {"message": "Password reset instructions sent to your email"}

@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    token_query = text("""
        SELECT user_id, expires_at, used
        FROM password_reset_tokens
        WHERE token = :token
    """)
    reset_token = db.execute(token_query, {"token": request.token}).first()
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    if reset_token[2] or reset_token[1] < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired or already used"
        )
    
    user_id = reset_token[0]
    
    role_query = text("""
        SELECT r.name FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = :user_id
    """)
    role = db.execute(role_query, {"user_id": user_id}).first()
    
    if role and role[0] == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin password reset not allowed through this endpoint"
        )
    
    update_query = text("UPDATE users SET password_hash = :password_hash WHERE id = :user_id")
    db.execute(update_query, {
        "password_hash": get_password_hash(request.new_password),
        "user_id": user_id
    })
    
    db.execute(text("UPDATE password_reset_tokens SET used = 1 WHERE token = :token"), {"token": request.token})
    db.commit()
    
    return {"message": "Password reset successfully"}

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_query = text("SELECT password_hash FROM users WHERE id = :user_id")
    user = db.execute(user_query, {"user_id": current_user["id"]}).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(request.current_password, user[0]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    update_query = text("UPDATE users SET password_hash = :password_hash WHERE id = :user_id")
    db.execute(update_query, {
        "password_hash": get_password_hash(request.new_password),
        "user_id": current_user["id"]
    })
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/generate-temp-password")
async def generate_temp_password(
    email: EmailStr,
    current_user: Dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user_query = text("SELECT id FROM users WHERE email = :email")
    user = db.execute(user_query, {"email": email}).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    temp_password = generate_random_password()
    
    update_query = text("UPDATE users SET password_hash = :password_hash WHERE id = :user_id")
    db.execute(update_query, {
        "password_hash": get_password_hash(temp_password),
        "user_id": user[0]
    })
    db.commit()
    
    print(f"Temporary password for {email}: {temp_password}")
    
    return {"message": "Temporary password generated and sent to user's email"}