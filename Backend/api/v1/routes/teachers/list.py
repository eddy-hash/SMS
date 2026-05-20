from fastapi import APIRouter

router = APIRouter()

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime

from api.v1.core.database import get_db
from api.v1.dependencies.auth import require_teacher, require_student

router = APIRouter(prefix="/results", tags=["Results"])

@router.get("/students/list")
async def get_all_results(
    student_id: Optional[int] = Query(None),
    course_id: Optional[int] = Query(None),
    academic_year: Optional[str] = Query(None),
    semester: Optional[str] = Query(None),
    exam_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    conditions = []
    params = {"limit": limit, "offset": offset}
    
    if student_id:
        conditions.append("r.student_id = :student_id")
        params["student_id"] = student_id
    if course_id:
        conditions.append("r.course_id = :course_id")
        params["course_id"] = course_id
    if academic_year:
        conditions.append("r.academic_year = :academic_year")
        params["academic_year"] = academic_year
    if semester:
        conditions.append("r.semester = :semester")
        params["semester"] = semester
    if exam_type:
        conditions.append("r.exam_type = :exam_type")
        params["exam_type"] = exam_type
    
    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
    
    query = text(f"""
        SELECT 
            r.id, r.student_id, s.name as student_name, r.course_id, c.course_code, c.course_name,
            r.academic_year, r.semester, r.marks, r.grade, r.gpa_points, r.exam_type,
            r.uploaded_by, u.name as uploaded_by_name, r.uploaded_at
        FROM results r
        LEFT JOIN students s ON r.student_id = s.id
        LEFT JOIN courses c ON r.course_id = c.id
        LEFT JOIN users u ON r.uploaded_by = u.id
        {where_clause}
        ORDER BY r.uploaded_at DESC
        LIMIT :limit OFFSET :offset
    """)
    
    results = db.execute(query, params).fetchall()
    
    count_query = text(f"SELECT COUNT(*) FROM results r {where_clause}")
    total = db.execute(count_query, params).scalar()
    
    return {
        "success": True,
        "total": total,
        "limit": limit,
        "offset": offset,
        "results": [
            {
                "id": r[0],
                "student_id": r[1],
                "student_name": r[2],
                "course_id": r[3],
                "course_code": r[4],
                "course_name": r[5],
                "academic_year": r[6],
                "semester": r[7],
                "marks": float(r[8]) if r[8] else None,
                "grade": r[9],
                "gpa_points": float(r[10]) if r[10] else None,
                "exam_type": r[11],
                "uploaded_by": r[12],
                "uploaded_by_name": r[13],
                "uploaded_at": str(r[14]) if r[14] else None
            }
            for r in results
        ]
    }

@router.get("/student/{student_id}")
async def get_student_results(
    student_id: int,
    academic_year: Optional[str] = Query(None),
    semester: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_student),
    db: Session = Depends(get_db)
):
    if current_user.get("role") == "student" and current_user.get("id") != student_id:
        raise HTTPException(403, "You can only view your own results")
    
    conditions = ["r.student_id = :student_id"]
    params = {"student_id": student_id}
    
    if academic_year:
        conditions.append("r.academic_year = :academic_year")
        params["academic_year"] = academic_year
    if semester:
        conditions.append("r.semester = :semester")
        params["semester"] = semester
    
    where_clause = " AND ".join(conditions)
    
    query = text(f"""
        SELECT 
            r.id, c.course_code, c.course_name, c.credits,
            r.academic_year, r.semester, r.marks, r.grade, r.gpa_points, r.exam_type,
            r.uploaded_at
        FROM results r
        JOIN courses c ON r.course_id = c.id
        WHERE {where_clause}
        ORDER BY r.academic_year DESC, r.semester DESC, c.course_code
    """)
    
    results = db.execute(query, params).fetchall()
    
    total_points = 0
    total_credits = 0
    
    formatted_results = []
    for r in results:
        credits = r[3] or 3
        gpa_points = float(r[8]) if r[8] else 0
        total_points += gpa_points * credits
        total_credits += credits
        
        formatted_results.append({
            "id": r[0],
            "course_code": r[1],
            "course_name": r[2],
            "credits": credits,
            "academic_year": r[4],
            "semester": r[5],
            "marks": float(r[6]) if r[6] else None,
            "grade": r[7],
            "gpa_points": gpa_points,
            "exam_type": r[9],
            "uploaded_at": str(r[10]) if r[10] else None
        })
    
    cgpa = total_points / total_credits if total_credits > 0 else None
    
    return {
        "success": True,
        "student_id": student_id,
        "total_courses": len(formatted_results),
        "total_credits": total_credits,
        "cgpa": round(cgpa, 2) if cgpa else None,
        "results": formatted_results
    }

@router.get("/course/{course_id}")
async def get_course_results(
    course_id: int,
    academic_year: Optional[str] = Query(None),
    semester: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    conditions = ["r.course_id = :course_id"]
    params = {"course_id": course_id}
    
    if academic_year:
        conditions.append("r.academic_year = :academic_year")
        params["academic_year"] = academic_year
    if semester:
        conditions.append("r.semester = :semester")
        params["semester"] = semester
    
    where_clause = " AND ".join(conditions)
    
    query = text(f"""
        SELECT 
            r.id, r.student_id, s.name as student_name, s.registration_number,
            r.academic_year, r.semester, r.marks, r.grade, r.gpa_points, r.exam_type
        FROM results r
        JOIN students s ON r.student_id = s.id
        WHERE {where_clause}
        ORDER BY r.marks DESC
    """)
    
    results = db.execute(query, params).fetchall()
    
    marks_list = [r[6] for r in results if r[6] is not None]
    average_marks = sum(marks_list) / len(marks_list) if marks_list else 0
    pass_count = len([r for r in results if r[7] and r[7] != 'F'])
    
    return {
        "success": True,
        "course_id": course_id,
        "total_students": len(results),
        "average_marks": round(average_marks, 2),
        "pass_count": pass_count,
        "fail_count": len(results) - pass_count,
        "results": [
            {
                "id": r[0],
                "student_id": r[1],
                "student_name": r[2],
                "registration_number": r[3],
                "academic_year": r[4],
                "semester": r[5],
                "marks": float(r[6]) if r[6] else None,
                "grade": r[7],
                "gpa_points": float(r[8]) if r[8] else None,
                "exam_type": r[9]
            }
            for r in results
        ]
    }

@router.get("/statistics")
async def get_results_statistics(
    academic_year: Optional[str] = Query(None),
    semester: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    conditions = []
    params = {}
    
    if academic_year:
        conditions.append("academic_year = :academic_year")
        params["academic_year"] = academic_year
    if semester:
        conditions.append("semester = :semester")
        params["semester"] = semester
    
    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
    
    query = text(f"""
        SELECT 
            COUNT(*) as total_results,
            AVG(marks) as average_marks,
            MIN(marks) as min_marks,
            MAX(marks) as max_marks,
            SUM(CASE WHEN grade != 'F' THEN 1 ELSE 0 END) as passed,
            SUM(CASE WHEN grade = 'F' THEN 1 ELSE 0 END) as failed,
            grade,
            COUNT(*) as grade_count
        FROM results
        {where_clause}
        GROUP BY grade
    """)
    
    stats = db.execute(query, params).fetchall()
    
    grade_distribution = {r[5]: r[6] for r in stats if r[5]}
    
    overall_query = text(f"""
        SELECT 
            COUNT(*) as total,
            AVG(marks) as avg_marks,
            MIN(marks) as min_marks,
            MAX(marks) as max_marks,
            SUM(CASE WHEN grade != 'F' THEN 1 ELSE 0 END) as total_passed,
            SUM(CASE WHEN grade = 'F' THEN 1 ELSE 0 END) as total_failed
        FROM results
        {where_clause}
    """)
    
    overall = db.execute(overall_query, params).first()
    
    return {
        "success": True,
        "filters": {
            "academic_year": academic_year,
            "semester": semester
        },
        "overall": {
            "total_results": overall[0] if overall else 0,
            "average_marks": round(overall[1], 2) if overall[1] else None,
            "min_marks": float(overall[2]) if overall[2] else None,
            "max_marks": float(overall[3]) if overall[3] else None,
            "total_passed": overall[4] if overall else 0,
            "total_failed": overall[5] if overall else 0,
            "pass_percentage": round((overall[4] / overall[0] * 100), 2) if overall and overall[0] > 0 else 0
        },
        "grade_distribution": grade_distribution
    }
