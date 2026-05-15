from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Optional
from pydantic import BaseModel
import jwt
import sys
import os
import traceback

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings

router = APIRouter(tags=["Departments"])

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

class DepartmentCreate(BaseModel):
    department_name: str
    faculty_id: Optional[int] = None

@router.get("/departments")
async def get_departments(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    try:
        result = db.execute(text("SELECT id, department_name, faculty_id FROM departments ORDER BY department_name"))
        departments = []
        for row in result:
            departments.append({
                "id": row[0],
                "name": row[1],  
                "department_name": row[1],
                "faculty_id": row[2]
            })
        return {"departments": departments, "total": len(departments)}
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()
        return {"departments": [], "total": 0}

@router.get("/departments/list")
async def get_departments_list(db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    """Get departments for dropdown"""
    try:
        result = db.execute(text("SELECT id, department_name FROM departments ORDER BY department_name"))
        departments = [{"id": r[0], "name": r[1], "department_name": r[1]} for r in result]
        return {"departments": departments}
    except Exception as e:
        print(f"Error: {e}")
        return {"departments": []}

@router.get("/departments/{dept_id}/courses")
async def get_department_courses(dept_id: int, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    try:
        result = db.execute(text("""
            SELECT id, course_code, course_name, credits 
            FROM courses 
            WHERE department_id = :dept_id
            ORDER BY course_name
        """), {"dept_id": dept_id})
        courses = [{"id": r[0], "course_code": r[1], "course_name": r[2], "credits": r[3]} for r in result]
        return {"courses": courses}
    except Exception as e:
        print(f"Error: {e}")
        return {"courses": []}

@router.post("/departments/create")
async def create_department(dept: DepartmentCreate, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    try:
        print(f"Creating department: {dept.department_name}")
        
     
        existing = db.execute(text("SELECT id FROM departments WHERE department_name = :name"), 
                              {"name": dept.department_name}).first()
        if existing:
            raise HTTPException(status_code=400, detail="Department name already exists")
       
        result = db.execute(text("""
            INSERT INTO departments (department_name, faculty_id)
            VALUES (:name, :faculty_id)
        """), {
            "name": dept.department_name,
            "faculty_id": dept.faculty_id
        })
        db.commit()
        
        return {
            "success": True,
            "message": "Department created successfully",
            "department_id": result.lastrowid
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Create department error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/departments/{dept_id}")
async def update_department(dept_id: int, dept: DepartmentCreate, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    try:
       
        existing = db.execute(text("SELECT id FROM departments WHERE id = :id"), {"id": dept_id}).first()
        if not existing:
            raise HTTPException(status_code=404, detail="Department not found")
        
      
        existing = db.execute(text("SELECT id FROM departments WHERE department_name = :name AND id != :id"), 
                              {"name": dept.department_name, "id": dept_id}).first()
        if existing:
            raise HTTPException(status_code=400, detail="Department name already exists")
        
        db.execute(text("""
            UPDATE departments 
            SET department_name = :name, faculty_id = :faculty_id
            WHERE id = :id
        """), {
            "name": dept.department_name,
            "faculty_id": dept.faculty_id,
            "id": dept_id
        })
        db.commit()
        
        return {"success": True, "message": "Department updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Update department error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/departments/{dept_id}")
async def delete_department(dept_id: int, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    try:
       
        existing = db.execute(text("SELECT id, department_name FROM departments WHERE id = :id"), {"id": dept_id}).first()
        if not existing:
            raise HTTPException(status_code=404, detail="Department not found")
        
     
        db.execute(text("UPDATE courses SET department_id = NULL WHERE department_id = :id"), {"id": dept_id})
        
     
        db.execute(text("DELETE FROM departments WHERE id = :id"), {"id": dept_id})
        db.commit()
        
        return {"success": True, "message": f"Department '{existing[1]}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Delete department error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/departments/{dept_id}")
async def get_department(dept_id: int, db: Session = Depends(get_db), current_user: Dict = Depends(verify_token)):
    try:
        result = db.execute(text("SELECT id, department_name, faculty_id FROM departments WHERE id = :id"), 
                           {"id": dept_id})
        row = result.first()
        if not row:
            raise HTTPException(status_code=404, detail="Department not found")
        
        return {
            "id": row[0],
            "name": row[1],
            "department_name": row[1],
            "faculty_id": row[2]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get department error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
