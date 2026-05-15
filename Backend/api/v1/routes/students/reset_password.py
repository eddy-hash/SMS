from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.v1.core.database import get_db
from pydantic import BaseModel

router = APIRouter()

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password using token
    """
    # Your reset password logic here
    return {"message": "Password reset successfully"}
