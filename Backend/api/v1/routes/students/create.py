from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Optional
from pydantic import BaseModel
import jwt
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(tags=["Student Create"])

class StudentCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    course_id: Optional[int] = None
    department_id: Optional[int] = None
    year_of_study: int = 1
    address: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    status: str = "active"

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/create")
async def create_student(student: StudentCreate, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    existing_email = db.execute(text("SELECT id FROM students WHERE email = :email"), 
                          {"email": student.email}).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    name_parts = student.full_name.strip().split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    
    existing_name = db.execute(
        text("SELECT id FROM students WHERE LOWER(CONCAT(first_name, ' ', last_name)) = LOWER(:full_name)"),
        {"full_name": student.full_name.strip()}
    ).first()
    
    if existing_name:
        raise HTTPException(status_code=400, detail="full name already exists")
    
    year = datetime.now().year
    result = db.execute(text("""
        SELECT registration_number FROM students 
        WHERE registration_number LIKE :pattern 
        ORDER BY id DESC LIMIT 1
    """), {"pattern": f"EAU/{year}/%"})
    
    last_reg = result.first()
    
    if last_reg and last_reg[0]:
        last_num = int(last_reg[0].split('/')[-1])
        new_num = last_num + 1
    else:
        new_num = 1
    
    reg_number = f"EAU/{year}/{new_num:04d}"
    
    result = db.execute(text("""
        INSERT INTO students (
            first_name, last_name, email, phone, course_id, department_id,
            year_of_study, address, guardian_name, guardian_phone,
            status, registration_number, created_at
        ) VALUES (
            :first_name, :last_name, :email, :phone, :course_id, :department_id,
            :year_of_study, :address, :guardian_name, :guardian_phone,
            :status, :reg_number, CURRENT_TIMESTAMP
        )
    """), {
        "first_name": first_name,
        "last_name": last_name,
        "email": student.email,
        "phone": student.phone,
        "course_id": student.course_id,
        "department_id": student.department_id,
        "year_of_study": student.year_of_study,
        "address": student.address,
        "guardian_name": student.guardian_name,
        "guardian_phone": student.guardian_phone,
        "status": student.status,
        "reg_number": reg_number
    })
    
    db.commit()
    
    return {
        "success": True,
        "message": "Student created successfully",
        "student_id": result.lastrowid,
        "registration_number": reg_number
    }