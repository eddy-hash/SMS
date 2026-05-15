from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Optional
from pydantic import BaseModel
import jwt
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(tags=["Student Update"])

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    course_id: Optional[int] = None
    year_of_study: Optional[int] = None
    address: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    status: Optional[str] = None

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.put("/{student_id}")
async def update_student(student_id: int, student: StudentUpdate, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    if not db.execute(text("SELECT id FROM students WHERE id = :id"), {"id": student_id}).first():
        raise HTTPException(status_code=404, detail="Student not found")
    updates, params = [], {"id": student_id}
    if student.full_name:
        parts = student.full_name.strip().split(" ", 1)
        updates.append("first_name = :first_name")
        updates.append("last_name = :last_name")
        params["first_name"] = parts[0]
        params["last_name"] = parts[1] if len(parts) > 1 else ""
    if student.email is not None:
        updates.append("email = :email")
        params["email"] = student.email
    if student.phone is not None:
        updates.append("phone = :phone")
        params["phone"] = student.phone
    if student.course_id is not None:
        updates.append("course_id = :course_id")
        params["course_id"] = student.course_id
    if student.year_of_study is not None:
        updates.append("year_of_study = :year_of_study")
        params["year_of_study"] = student.year_of_study
    if student.address is not None:
        updates.append("address = :address")
        params["address"] = student.address
    if student.guardian_name is not None:
        updates.append("guardian_name = :guardian_name")
        params["guardian_name"] = student.guardian_name
    if student.guardian_phone is not None:
        updates.append("guardian_phone = :guardian_phone")
        params["guardian_phone"] = student.guardian_phone
    if student.status is not None:
        updates.append("status = :status")
        params["status"] = student.status
    if updates:
        db.execute(text(f"UPDATE students SET {', '.join(updates)} WHERE id = :id"), params)
        db.commit()
    return {"success": True, "message": "Student updated successfully"}
