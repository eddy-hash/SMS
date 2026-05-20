from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

from api.v1.core.database import get_db
from api.v1.dependencies.auth import require_admin, get_current_user

router = APIRouter()

class TeacherUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    gender: Optional[str] = None
    department_id: Optional[int] = None
    course: Optional[str] = None
    phone: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str


@router.put("/teacher/{teacher_id}")
async def update_teacher(
    teacher_id: int,
    teacher_data: TeacherUpdate,
    current_user: Dict[str, Any] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Only admin can update teacher information")
    
    check_query = text("SELECT id FROM teachers WHERE id = :id")
    existing = db.execute(check_query, {"id": teacher_id}).first()
    
    if not existing:
        raise HTTPException(404, f"Teacher with ID {teacher_id} not found")
    
    if teacher_data.email:
        email_check = text("SELECT id FROM teachers WHERE email = :email AND id != :id")
        email_exists = db.execute(email_check, {
            "email": teacher_data.email,
            "id": teacher_id
        }).first()
        
        if email_exists:
            raise HTTPException(400, f"Email {teacher_data.email} already exists")
    
    update_fields = []
    params = {"id": teacher_id, "updated_at": datetime.now()}
    
    if teacher_data.first_name:
        update_fields.append("first_name = :first_name")
        params["first_name"] = teacher_data.first_name
    
    if teacher_data.last_name:
        update_fields.append("last_name = :last_name")
        params["last_name"] = teacher_data.last_name
    
    if teacher_data.email:
        update_fields.append("email = :email")
        params["email"] = teacher_data.email
    
    if teacher_data.gender:
        update_fields.append("gender = :gender")
        params["gender"] = teacher_data.gender
    
    if teacher_data.department_id:
        dept_check = text("SELECT id FROM departments WHERE id = :id")
        dept_exists = db.execute(dept_check, {"id": teacher_data.department_id}).first()
        
        if not dept_exists:
            raise HTTPException(400, f"Department with ID {teacher_data.department_id} not found")
        
        update_fields.append("department_id = :department_id")
        params["department_id"] = teacher_data.department_id
    
    if teacher_data.course:
        update_fields.append("course = :course")
        params["course"] = teacher_data.course
    
    if teacher_data.phone:
        update_fields.append("phone = :phone")
        params["phone"] = teacher_data.phone
    
    if not update_fields:
        raise HTTPException(400, "No fields to update")
    
    update_fields.append("updated_at = :updated_at")
    
    update_query = text(f"""
        UPDATE teachers 
        SET {', '.join(update_fields)}
        WHERE id = :id
    """)
    
    db.execute(update_query, params)
    db.commit()
    
    get_teacher_query = text("""
        SELECT 
            t.id, t.first_name, t.last_name, t.email, t.gender,
            t.registration_number, t.department_id, d.department_name,
            t.course, t.is_active, t.created_at, t.updated_at
        FROM teachers t
        LEFT JOIN departments d ON t.department_id = d.id
        WHERE t.id = :id
    """)
    
    updated_teacher = db.execute(get_teacher_query, {"id": teacher_id}).first()
    
    return {
        "success": True,
        "message": "Teacher updated successfully",
        "teacher": {
            "id": updated_teacher[0],
            "first_name": updated_teacher[1],
            "last_name": updated_teacher[2],
            "full_name": f"{updated_teacher[1]} {updated_teacher[2]}",
            "email": updated_teacher[3],
            "gender": updated_teacher[4],
            "registration_number": updated_teacher[5],
            "department_id": updated_teacher[6],
            "department_name": updated_teacher[7],
            "course": updated_teacher[8],
            "is_active": bool(updated_teacher[9]),
            "created_at": str(updated_teacher[10]) if updated_teacher[10] else None,
            "updated_at": str(updated_teacher[11]) if updated_teacher[11] else None
        }
    }


@router.put("/teacher/{teacher_id}/department")
async def update_teacher_department(
    teacher_id: int,
    department_id: int,
    current_user: Dict[str, Any] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Only admin can update teacher department")
    
    teacher_check = text("SELECT id FROM teachers WHERE id = :id")
    teacher_exists = db.execute(teacher_check, {"id": teacher_id}).first()
    
    if not teacher_exists:
        raise HTTPException(404, f"Teacher with ID {teacher_id} not found")
    
    dept_check = text("SELECT id, department_name FROM departments WHERE id = :id")
    department = db.execute(dept_check, {"id": department_id}).first()
    
    if not department:
        raise HTTPException(400, f"Department with ID {department_id} not found")
    
    update_query = text("""
        UPDATE teachers 
        SET department_id = :department_id, updated_at = :updated_at 
        WHERE id = :id
    """)
    
    db.execute(update_query, {
        "department_id": department_id,
        "updated_at": datetime.now(),
        "id": teacher_id
    })
    
    db.commit()
    
    return {
        "success": True,
        "message": "Teacher department updated successfully",
        "teacher_id": teacher_id,
        "department_id": department_id,
        "department_name": department[1]
    }


@router.patch("/teacher/{teacher_id}/toggle-status")
async def toggle_teacher_status(
    teacher_id: int,
    current_user: Dict[str, Any] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Only admin can toggle teacher status")
    
    check_query = text("SELECT id, is_active FROM teachers WHERE id = :id")
    teacher = db.execute(check_query, {"id": teacher_id}).first()
    
    if not teacher:
        raise HTTPException(404, f"Teacher with ID {teacher_id} not found")
    
    new_status = not teacher[1]
    
    update_query = text("""
        UPDATE teachers 
        SET is_active = :is_active, updated_at = :updated_at 
        WHERE id = :id
    """)
    
    db.execute(update_query, {
        "is_active": new_status,
        "updated_at": datetime.now(),
        "id": teacher_id
    })
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Teacher {'activated' if new_status else 'deactivated'} successfully",
        "teacher_id": teacher_id,
        "is_active": bool(new_status)
    }
