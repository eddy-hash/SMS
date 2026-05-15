from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.v1.core.database import get_db
from pydantic import BaseModel

router = APIRouter()

class ForgetPasswordRequest(BaseModel):
    email: str

@router.post("/forget-password")
async def forget_password(
    request: ForgetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Send password reset email
    """
    # Your forget password logic here
    return {"message": "If email exists, reset link sent"}
