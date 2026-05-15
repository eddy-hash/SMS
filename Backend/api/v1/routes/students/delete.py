from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict
import jwt
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(tags=["Student Delete"])

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.delete("/{student_id}")
async def delete_student(student_id: int, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    result = db.execute(text("SELECT id, first_name, last_name FROM students WHERE id = :id"), {"id": student_id})
    student = result.first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.execute(text("UPDATE students SET status = 'deleted' WHERE id = :id"), {"id": student_id})
    db.commit()
    return {"success": True, "message": f"Student '{student[1]} {student[2]}' deactivated"}
