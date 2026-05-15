from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, EmailStr
import secrets
from datetime import datetime, timedelta

from api.v1.dependencies.database import get_db
from api.v1.core.config import settings
from api.v1.dependencies.auth import get_password_hash

router = APIRouter(tags=["Forgot Password"])

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user_query = text("""
        SELECT id, email, 'admin' as role FROM admin WHERE email = :email
        UNION
        SELECT id, email, 'user' as role FROM users WHERE email = :email
    """)
    user = db.execute(user_query, {"email": request.email}).first()
    
    if not user:
        return {"message": "If your email is registered, you will receive reset instructions"}
    
    
    if user[2] == "admin":
        return {"message": "Admin password reset must be done by system administrator"}
    
    db.execute(text("DELETE FROM password_reset_tokens WHERE user_id = :user_id"), {"user_id": user[0]})
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    db.execute(text("""
        INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
        VALUES (:user_id, :token, :expires_at, :created_at)
    """), {
        "user_id": user[0],
        "token": token,
        "expires_at": expires_at,
        "created_at": datetime.utcnow()
    })
    db.commit()
    
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    print(f"Reset link for {request.email}: {reset_link}")
    
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
    
    update_query = text("UPDATE users SET password_hash = :password_hash WHERE id = :user_id")
    db.execute(update_query, {
        "password_hash": get_password_hash(request.new_password),
        "user_id": reset_token[0]
    })
    

    db.execute(text("UPDATE password_reset_tokens SET used = 1 WHERE token = :token"), {"token": request.token})
    db.commit()
    
    return {"message": "Password reset successfully"}