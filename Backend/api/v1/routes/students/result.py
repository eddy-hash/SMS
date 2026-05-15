from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime

from api.v1.core.database import get_db
from api.v1.dependencies.auth import require_student

router = APIRouter(prefix="/results", tags=["Student Results"])

@router.get("/academic-info")
async def get_academic_info(
    current_user: Dict[str, Any] = Depends(require_student),
    db: Session = Depends(get_db)
):
    student_id = current_user.get("id")
    if not student_id:
        raise HTTPException(400, "Student ID not found")
    
    # Default values if program info is missing
    default_duration = 3
    default_intake = 2024
    default_current_year = 1
    program_type = "bachelors"
    
    try:
        query = text("""
            SELECT 
                COALESCE(p.program_type, :default_type) as program_type,
                COALESCE(p.duration_years, :default_duration) as duration_years,
                COALESCE(s.intake_year, :default_intake) as intake_year,
                COALESCE(s.year_of_study, :default_current_year) as current_year
            FROM students s
            LEFT JOIN programs p ON s.program_id = p.id
            WHERE s.id = :student_id
        """)
        row = db.execute(query, {
            "student_id": student_id,
            "default_type": program_type,
            "default_duration": default_duration,
            "default_intake": default_intake,
            "default_current_year": default_current_year
        }).first()
        
        if row:
            program_type = row[0]
            default_duration = row[1]
            default_intake = row[2]
            default_current_year = row[3]
    except Exception as e:
        print(f"Error fetching academic info: {e}")
    
    academic_years = []
    for i in range(default_duration):
        start_year = default_intake + i
        end_year = start_year + 1
        academic_years.append(f"{start_year}-{end_year}")
    
    return {
        "program_type": program_type.lower(),
        "duration": default_duration,
        "intake_year": default_intake,
        "current_year": default_current_year,
        "academic_years": academic_years
    }

@router.get("/semester-results")
async def get_semester_results(
    academic_year: str = Query(..., description="e.g., 2024-2025"),
    semester: int = Query(..., ge=1, le=2, description="1 or 2"),
    current_user: Dict[str, Any] = Depends(require_student),
    db: Session = Depends(get_db)
):
    student_id = current_user.get("id")
    if not student_id:
        raise HTTPException(400, "Student ID not found")
    
    try:
        # Query using enrollments and results tables
        query = text("""
            SELECT 
                c.course_code,
                c.course_name,
                COALESCE(c.course_type, 'Core') as course_type,
                c.credits,
                r.grade,
                r.marks_obtained as marks
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN results r ON r.enrollment_id = e.id 
                AND r.academic_year = :academic_year 
                AND r.semester = :semester
            WHERE e.student_id = :student_id 
                AND e.academic_year = :academic_year 
                AND e.semester = :semester
            ORDER BY c.course_code
        """)
        rows = db.execute(query, {
            "student_id": student_id,
            "academic_year": academic_year,
            "semester": semester
        }).fetchall()
        
        results = []
        total_points = 0
        total_credits = 0
        grade_map = {
            "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
            "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0
        }
        
        for row in rows:
            credits = row[3] or 3
            grade = row[4]
            points = grade_map.get(grade, 0) if grade else 0
            total_points += points * credits
            total_credits += credits
            results.append({
                "code": row[0],
                "name": row[1],
                "course_type": row[2],
                "credits": credits,
                "grade": grade or "-",
                "marks": row[5] if row[5] is not None else None
            })
        
        gpa = total_points / total_credits if total_credits > 0 else None
        
        return {
            "success": True,
            "results": results,
            "gpa": gpa,
            "total_credits": total_credits
        }
    
    except Exception as e:
        print(f"Error fetching semester results: {e}")
        return {
            "success": True,
            "results": [],
            "gpa": None,
            "total_credits": 0
        }
@router.get("/assessments")
async def get_student_assessments(
    academic_year: str = Query(..., description="e.g., 2024-2025"),
    semester: int = Query(..., ge=1, le=2),
    current_user: Dict[str, Any] = Depends(require_student),
    db: Session = Depends(get_db)
):
    student_id = current_user.get("id")
    if not student_id:
        raise HTTPException(400, "Student ID not found")
    
    # Query assessments from a hypothetical 'assessments' table
    # You may have 'course_assignments', 'tests', etc. Adjust accordingly.
    query = text("""
        SELECT 
            c.id as course_id,
            c.course_code,
            c.course_name,
            a.id as assessment_id,
            a.assessment_name,
            a.assessment_type,
            a.max_marks,
            a.weight,
            sa.obtained_marks,
            sa.grade,
            sa.submitted_at
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN assessments a ON a.course_id = c.id AND a.academic_year = :academic_year AND a.semester = :semester
        LEFT JOIN student_assessments sa ON sa.assessment_id = a.id AND sa.student_id = :student_id
        WHERE e.student_id = :student_id 
            AND e.academic_year = :academic_year 
            AND e.semester = :semester
        ORDER BY c.course_name, a.due_date
    """)
    rows = db.execute(query, {
        "student_id": student_id,
        "academic_year": academic_year,
        "semester": semester
    }).fetchall()
    
    # Group by course
    courses_dict = {}
    for row in rows:
        course_id = row[0]
        if course_id not in courses_dict:
            courses_dict[course_id] = {
                "id": course_id,
                "code": row[1],
                "name": row[2],
                "assessments": []
            }
        if row[3]:  # assessment exists
            courses_dict[course_id]["assessments"].append({
                "id": row[3],
                "name": row[4],
                "type": row[5],
                "max_marks": row[6],
                "weight": row[7],
                "obtained_marks": row[8],
                "grade": row[9],
                "submitted_at": str(row[10]) if row[10] else None
            })
    
    return {
        "success": True,
        "academic_year": academic_year,
        "semester": semester,
        "courses": list(courses_dict.values())
    }   