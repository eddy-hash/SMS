from fastapi import APIRouter

router = APIRouter()

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime
import hashlib
import secrets
import string

from api.v1.core.database import get_db
from api.v1.dependencies.auth import require_admin

router = APIRouter(prefix="/create", tags=["Teacher Creation"])

def generate_registration_number(year: int, db: Session) -> str:
    query = text("""
        SELECT registration_number FROM users 
        WHERE registration_number LIKE :pattern 
        ORDER BY id DESC LIMIT 1
    """)
    
    pattern = f'EAU/TECH/{year}/%'
    last_teacher = db.execute(query, {"pattern": pattern}).first()
    
    if last_teacher:
        last_number = int(last_teacher[0].split('/')[-1])
        new_number = last_number + 1
    else:
        new_number = 1
    
    return f'EAU/TECH/{year}/{new_number:03d}'

def generate_temp_password(length: int = 10) -> str:
    alphabet = string.ascii_letters + string.digits
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/teacher")
async def create_teacher(
    name: str,
    email: str,
    phone: Optional[str] = None,
    department: Optional[str] = None,
    designation: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Only admin can create teacher accounts")
    
    check_email = text("SELECT id FROM users WHERE email = :email")
    existing = db.execute(check_email, {"email": email}).first()
    
    if existing:
        raise HTTPException(400, f"Email {email} already exists")
    
    current_year = datetime.now().year
    registration_number = generate_registration_number(current_year, db)
    temp_password = generate_temp_password()
    hashed_password = hash_password(temp_password)
    
    insert_query = text("""
        INSERT INTO users (name, email, phone, registration_number, password, role, department, designation, is_active, created_at, updated_at)
        VALUES (:name, :email, :phone, :registration_number, :password, 'teacher', :department, :designation, 1, :created_at, :updated_at)
    """)
    
    db.execute(insert_query, {
        "name": name,
        "email": email,
        "phone": phone,
        "registration_number": registration_number,
        "password": hashed_password,
        "department": department,
        "designation": designation,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    })
    
    db.commit()
    
    get_user_query = text("SELECT id FROM users WHERE registration_number = :reg_no")
    new_user = db.execute(get_user_query, {"reg_no": registration_number}).first()
    
    return {
        "success": True,
        "message": "Teacher created successfully",
        "teacher": {
            "id": new_user[0] if new_user else None,
            "name": name,
            "email": email,
            "phone": phone,
            "registration_number": registration_number,
            "department": department,
            "designation": designation,
            "temporary_password": temp_password,
            "role": "teacher"
        }
    }

@router.post("/teacher/bulk")
async def create_multiple_teachers(
    teachers: list,
    current_user: Dict[str, Any] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Only admin can create teacher accounts")
    
    created = []
    failed = []
    current_year = datetime.now().year
    
    for idx, teacher in enumerate(teachers):
        try:
            if not teacher.get('name') or not teacher.get('email'):
                failed.append({
                    "index": idx,
                    "error": "Name and email are required"
                })
                continue
            
            check_email = text("SELECT id FROM users WHERE email = :email")
            existing = db.execute(check_email, {"email": teacher['email']}).first()
            
            if existing:
                failed.append({
                    "index": idx,
                    "email": teacher['email'],
                    "error": "Email already exists"
                })
                continue
            
            registration_number = generate_registration_number(current_year, db)
            temp_password = generate_temp_password()
            hashed_password = hash_password(temp_password)
            
            insert_query = text("""
                INSERT INTO users (name, email, phone, registration_number, password, role, department, designation, is_active, created_at, updated_at)
                VALUES (:name, :email, :phone, :registration_number, :password, 'teacher', :department, :designation, 1, :created_at, :updated_at)
            """)
            
            db.execute(insert_query, {
                "name": teacher['name'],
                "email": teacher['email'],
                "phone": teacher.get('phone'),
                "registration_number": registration_number,
                "password": hashed_password,
                "department": teacher.get('department'),
                "designation": teacher.get('designation'),
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            })
            
            created.append({
                "name": teacher['name'],
                "email": teacher['email'],
                "registration_number": registration_number,
                "temporary_password": temp_password
            })
            
        except Exception as e:
            failed.append({
                "index": idx,
                "email": teacher.get('email', 'Unknown'),
                "error": str(e)
            })
    
    db.commit()
    
    return {
        "success": True,
        "total": len(teachers),
        "created": len(created),
        "failed": len(failed),
        "created_teachers": created,
        "failed_records": failed
    }

@router.post("/teacher/reset-password/{teacher_id}")
async def reset_teacher_password(
    teacher_id: int,
    current_user: Dict[str, Any] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Only admin can reset teacher passwords")
    
    check_query = text("SELECT id, name, email FROM users WHERE id = :id AND role = 'teacher'")
    teacher = db.execute(check_query, {"id": teacher_id}).first()
    
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    
    new_password = generate_temp_password()
    hashed_password = hash_password(new_password)
    
    update_query = text("""
        UPDATE users SET password = :password, updated_at = :updated_at WHERE id = :id
    """)
    
    db.execute(update_query, {
        "password": hashed_password,
        "updated_at": datetime.now(),
        "id": teacher_id
    })
    
    db.commit()
    
    return {
        "success": True,
        "message": "Password reset successfully",
        "teacher_id": teacher_id,
        "teacher_name": teacher[1],
        "teacher_email": teacher[2],
        "new_temporary_password": new_password
    }

@router.get("/teachers")
async def list_teachers(
    department: Optional[str] = None,
    is_active: Optional[bool] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: Dict[str, Any] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Only admin can view teacher list")
    
    conditions = ["role = 'teacher'"]
    params = {"limit": limit, "offset": offset}
    
    if department:
        conditions.append("department = :department")
        params["department"] = department
    if is_active is not None:
        conditions.append("is_active = :is_active")
        params["is_active"] = is_active
    
    where_clause = " AND ".join(conditions)
    
    query = text(f"""
        SELECT id, name, email, phone, registration_number, department, designation, is_active, created_at
        FROM users
        WHERE {where_clause}
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    
    teachers = db.execute(query, params).fetchall()
    
    count_query = text(f"SELECT COUNT(*) FROM users WHERE {where_clause}")
    total = db.execute(count_query, params).scalar()
    
    return {
        "success": True,
        "total": total,
        "limit": limit,
        "offset": offset,
        "teachers": [
            {
                "id": t[0],
                "name": t[1],
                "email": t[2],
                "phone": t[3],
                "registration_number": t[4],
                "department": t[5],
                "designation": t[6],
                "is_active": bool(t[7]),
                "created_at": str(t[8]) if t[8] else None
            }
            for t in teachers
        ]
    }

@router.put("/teacher/{teacher_id}/activate")
async def activate_teacher(
    teacher_id: int,
    current_user: Dict[str, Any] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Only admin can activate/deactivate teachers")
    
    update_query = text("""
        UPDATE users SET is_active = 1, updated_at = :updated_at WHERE id = :id AND role = 'teacher'
    """)
    
    result = db.execute(update_query, {
        "updated_at": datetime.now(),
        "id": teacher_id
    })
    
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(404, "Teacher not found")
    
    return {"success": True, "message": "Teacher activated successfully"}

@router.put("/teacher/{teacher_id}/deactivate")
async def deactivate_teacher(
    teacher_id: int,
    current_user: Dict[str, Any] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Only admin can activate/deactivate teachers")
    
    update_query = text("""
        UPDATE users SET is_active = 0, updated_at = :updated_at WHERE id = :id AND role = 'teacher'
    """)
    
    result = db.execute(update_query, {
        "updated_at": datetime.now(),
        "id": teacher_id
    })
    
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(404, "Teacher not found")
    
    return {"success": True, "message": "Teacher deactivated successfully"}
