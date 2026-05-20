from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, Any

from api.v1.core.database import get_db
from api.v1.dependencies.auth import require_teacher, require_admin

router = APIRouter()  # No prefix - main teachers router will add /teacher

# ----------------------------
# Shared DB fetch function
# ----------------------------
def fetch_teacher(db: Session, teacher_id: int):
    query = text("""
        SELECT
            t.id,
            t.first_name,
            t.last_name,
            t.email,
            t.gender,
            t.registration_number,
            t.department_id,
            d.department_name,
            t.course,
            t.is_active,
            t.created_at,
            t.updated_at,
            t.last_login,
            COUNT(DISTINCT ul.upload_id) as total_uploads,
            COALESCE(SUM(ul.successful_records), 0) as total_results_uploaded
        FROM teachers t
        LEFT JOIN departments d ON t.department_id = d.id
        LEFT JOIN upload_logs ul ON t.id = ul.teacher_id
        WHERE t.id = :teacher_id
        GROUP BY t.id
    """)

    return db.execute(query, {"teacher_id": teacher_id}).first()


def format_teacher(t):
    return {
        "success": True,
        "teacher": {
            "id": t[0],
            "first_name": t[1],
            "last_name": t[2],
            "full_name": f"{t[1]} {t[2]}",
            "email": t[3],
            "gender": t[4],
            "registration_number": t[5],
            "department_id": t[6],
            "department_name": t[7],
            "course": t[8],
            "is_active": bool(t[9]),
            "created_at": str(t[10]) if t[10] else None,
            "updated_at": str(t[11]) if t[11] else None,
            "last_login": str(t[12]) if t[12] else None,
            "statistics": {
                "total_uploads": t[13] or 0,
                "total_results_uploaded": t[14] or 0
            }
        }
    }


# ----------------------------
# GET LOGGED IN TEACHER PROFILE
# ----------------------------
@router.get("/profile")
async def my_profile(
    current_user: Dict[str, Any] = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    teacher_id = current_user.get("user_id") or current_user.get("id")
    
    if not teacher_id:
        raise HTTPException(400, "Teacher ID missing")
    
    teacher = fetch_teacher(db, teacher_id)
    
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    
    return format_teacher(teacher)


# ----------------------------
# GET ANY TEACHER (ADMIN ONLY)
# ----------------------------
@router.get("/{teacher_id}")
async def teacher_detail(
    teacher_id: int,
    current_user: Dict[str, Any] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    teacher = fetch_teacher(db, teacher_id)
    
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    
    return format_teacher(teacher)