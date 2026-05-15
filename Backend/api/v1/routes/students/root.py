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

router = APIRouter(tags=["Student Root"])

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/")
async def get_all_students(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    # Use course_name instead of name
    result = db.execute(text("""
        SELECT s.id, s.first_name, s.last_name, s.email, s.phone, 
               s.registration_number, s.course_id, s.year_of_study, s.status, 
               c.course_name as course_name 
        FROM students s 
        LEFT JOIN courses c ON s.course_id = c.id 
        ORDER BY s.id DESC
    """))
    
    students = []
    for row in result:
        full_name = f"{row[1]} {row[2]}".strip()
        students.append({
            "id": row[0],
            "full_name": full_name if full_name else f"Student {row[0]}",
            "email": row[3] or "",
            "phone": str(row[4]) if row[4] else "N/A",
            "registration_number": row[5] or f"REG{row[0]:06d}",
            "course_name": row[9] if len(row) > 9 and row[9] else "No Course",
            "year_of_study": row[7] or 1,
            "status": row[8] or "active"
        })
    
    return {"students": students, "total": len(students)}
