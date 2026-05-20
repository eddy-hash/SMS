from fastapi import APIRouter

router = APIRouter()

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from api.v1.core.database import get_db
from api.v1.dependencies.auth import require_teacher

router = APIRouter(prefix="/delete", tags=["Teacher Delete"])

@router.delete("/result/{result_id}")
async def delete_result_by_id(
    result_id: int,
    current_user: Dict[str, Any] = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    teacher_id = current_user.get("id")
    if not teacher_id:
        raise HTTPException(400, "Teacher ID not found")
    
    check_query = text("SELECT id FROM results WHERE id = :result_id")
    existing = db.execute(check_query, {"result_id": result_id}).first()
    
    if not existing:
        raise HTTPException(404, f"Result with ID {result_id} not found")
    
    delete_query = text("DELETE FROM results WHERE id = :result_id")
    db.execute(delete_query, {"result_id": result_id})
    db.commit()
    
    return {"success": True, "message": f"Result with ID {result_id} deleted successfully"}

@router.delete("/results")
async def delete_results_by_filters(
    student_id: Optional[int] = Query(None),
    course_id: Optional[int] = Query(None),
    academic_year: Optional[str] = Query(None),
    semester: Optional[str] = Query(None),
    exam_type: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    teacher_id = current_user.get("id")
    if not teacher_id:
        raise HTTPException(400, "Teacher ID not found")
    
    if not any([student_id, course_id, academic_year, semester, exam_type]):
        raise HTTPException(400, "At least one filter parameter is required")
    
    conditions = []
    params = {}
    
    if student_id:
        conditions.append("student_id = :student_id")
        params["student_id"] = student_id
    if course_id:
        conditions.append("course_id = :course_id")
        params["course_id"] = course_id
    if academic_year:
        conditions.append("academic_year = :academic_year")
        params["academic_year"] = academic_year
    if semester:
        conditions.append("semester = :semester")
        params["semester"] = semester
    if exam_type:
        conditions.append("exam_type = :exam_type")
        params["exam_type"] = exam_type
    
    select_query = text(f"SELECT COUNT(*) FROM results WHERE {' AND '.join(conditions)}")
    count = db.execute(select_query, params).scalar()
    
    if count == 0:
        raise HTTPException(404, "No results found matching the filters")
    
    delete_query = text(f"DELETE FROM results WHERE {' AND '.join(conditions)}")
    db.execute(delete_query, params)
    db.commit()
    
    return {"success": True, "message": f"Deleted {count} result(s) successfully", "deleted_count": count}

@router.delete("/student/{student_id}/all-results")
async def delete_all_student_results(
    student_id: int,
    current_user: Dict[str, Any] = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    teacher_id = current_user.get("id")
    if not teacher_id:
        raise HTTPException(400, "Teacher ID not found")
    
    check_query = text("SELECT COUNT(*) FROM results WHERE student_id = :student_id")
    count = db.execute(check_query, {"student_id": student_id}).scalar()
    
    if count == 0:
        raise HTTPException(404, f"No results found for student ID {student_id}")
    
    delete_query = text("DELETE FROM results WHERE student_id = :student_id")
    db.execute(delete_query, {"student_id": student_id})
    db.commit()
    
    return {"success": True, "message": f"Deleted {count} result(s) for student ID {student_id}", "deleted_count": count}
