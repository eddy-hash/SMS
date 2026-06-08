import sys
import os
import math
from typing import Dict, Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
import jwt
from pydantic import BaseModel, Field

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from api.v1.dependencies.database import get_db
from api.v1.core.config import settings


DEFAULT_PAGE = 1
DEFAULT_PER_PAGE = 10
MAX_PER_PAGE = 100
DEFAULT_SORT = "id"
SORT_ORDER = "DESC"


class StudentResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    registration_number: str
    course_id: Optional[int] = None
    course_name: str
    year_of_study: int
    status: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True


class PaginationResponse(BaseModel):
    current_page: int
    per_page: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool


class StudentListResponse(BaseModel):
    data: List[StudentResponse]
    pagination: PaginationResponse



router = APIRouter(tags=["Student List"])


def verify_token(authorization: str = Header(None)) -> Dict[str, Any]:
    """
    Verify JWT token from Authorization header.
    
    Args:
        authorization: Authorization header containing Bearer token
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="No authorization token provided"
        )
    
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token verification failed")



def build_search_condition(search: Optional[str]) -> tuple[str, Dict[str, str]]:
    """
    Build SQL search condition and parameters.
    
    Args:
        search: Search term to apply
        
    Returns:
        Tuple of (search_condition_sql, params_dict)
    """
    if not search or not search.strip():
        return "", {}
    
    search_term = f"%{search.strip()}%"
    search_condition = (
        "WHERE s.first_name LIKE :search "
        "OR s.last_name LIKE :search "
        "OR s.email LIKE :search "
        "OR s.registration_number LIKE :search"
    )
    return search_condition, {"search": search_term}


def get_total_count(db: Session, search_condition: str, params: Dict[str, str]) -> int:
    """
    Get total count of students matching search criteria.
    
    Args:
        db: Database session
        search_condition: WHERE clause for filtering
        params: Query parameters
        
    Returns:
        Total number of students
    """
    query = f"SELECT COUNT(*) FROM students s {search_condition}"
    result = db.execute(text(query), params)
    return result.scalar() or 0


def calculate_pagination(total: int, per_page: int, page: int) -> Dict[str, Any]:
    """
    Calculate pagination metadata.
    
    Args:
        total: Total number of records
        per_page: Records per page
        page: Current page number
        
    Returns:
        Pagination metadata dictionary
    """
    total_pages = math.ceil(total / per_page) if total > 0 else 1
    
    return {
        "current_page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }


def format_student_record(row: Any) -> Dict[str, Any]:
    """
    Format database row into student dictionary.
    
    Args:
        row: SQLAlchemy result row
        
    Returns:
        Formatted student dictionary
    """
    first_name = row[1] or ""
    last_name = row[2] or ""
    full_name = f"{first_name} {last_name}".strip() or f"Student {row[0]}"
    
    return {
        "id": row[0],
        "full_name": full_name,
        "email": row[3] or "",
        "phone": str(row[4]) if row[4] else "N/A",
        "registration_number": row[5] or f"REG{row[0]:06d}",
        "course_id": row[6],
        "course_name": row[15] if len(row) > 15 and row[15] else "No Course",
        "year_of_study": row[7] or 1,
        "status": row[8] or "active",
        "department_id": row[13],
        "department_name": row[16] if len(row) > 16 and row[16] else None,
    }


def get_student_query(search_condition: str, offset: int, limit: int) -> str:
    """
    Build the SQL query for fetching students.
    
    Args:
        search_condition: WHERE clause for filtering
        offset: Number of records to skip
        limit: Number of records to fetch
        
    Returns:
        SQL query string
    """
    return f"""
        SELECT 
            s.id, 
            s.first_name, 
            s.last_name, 
            s.email, 
            s.phone, 
            s.registration_number, 
            s.course_id, 
            s.year_of_study, 
            s.status, 
            s.address, 
            s.guardian_name, 
            s.guardian_phone, 
            s.created_at,
            s.department_id,
            c.id as course_id_join,
            c.course_name,
            d.department_name
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN departments d ON s.department_id = d.id
        {search_condition}
        ORDER BY s.{DEFAULT_SORT} {SORT_ORDER}
        LIMIT :limit OFFSET :offset
    """



@router.get("/list", response_model=StudentListResponse)
async def get_students_list(
    page: int = Query(DEFAULT_PAGE, ge=1, description="Page number"),
    per_page: int = Query(
        DEFAULT_PER_PAGE, 
        ge=1, 
        le=MAX_PER_PAGE,
        description="Records per page"
    ),
    search: Optional[str] = Query(
        None,
        description="Search by first name, last name, email, or registration number"
    ),
    db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token),
) -> StudentListResponse:
    """
    Get paginated list of students with optional search filtering.
    
    Query Parameters:
        - page: Page number (default: 1)
        - per_page: Records per page (default: 10, max: 100)
        - search: Search term for filtering students
        
    Returns:
        StudentListResponse with student data and pagination info
        
    Raises:
        HTTPException: If authentication fails or database error occurs
    """
    try:
      
        offset = (page - 1) * per_page
        
        
        search_condition, search_params = build_search_condition(search)
        
        
        total = get_total_count(db, search_condition, search_params)
        
        
        pagination = calculate_pagination(total, per_page, page)
        

        params = {**search_params, "limit": per_page, "offset": offset}
        
        
        query = get_student_query(search_condition, offset, per_page)
        result = db.execute(text(query), params)
        
        
        students = [format_student_record(row) for row in result]
        
        return StudentListResponse(
            data=students,
            pagination=pagination
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


@router.get("/list/departments")
async def get_departments(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token),
) -> Dict[str, Any]:
    """
    Get list of all departments for filtering.
    
    Returns:
        Dictionary containing department list
    """
    try:
        result = db.execute(text("SELECT id, department_name as name FROM departments ORDER BY department_name ASC"))
        departments = [{"id": row[0], "name": row[1]} for row in result]
        return {"data": departments}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching departments: {str(e)}"
        )


@router.get("/list/courses")
async def get_courses(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token),
) -> Dict[str, Any]:
    """
    Get list of all courses for filtering.
    
    Returns:
        Dictionary containing course list
    """
    try:
        result = db.execute(text("SELECT id, course_name FROM courses ORDER BY course_name ASC"))
        courses = [{"id": row[0], "course_name": row[1]} for row in result]
        return {"data": courses}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching courses: {str(e)}"
        )
@router.get("/available-electives")
async def get_available_electives(
    semester: int = Query(..., description="Semester (1 or 2)"),
    db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)  # or use your auth dependency
):
    # Only students can access
    if current_user.get("role") != "student":
        raise HTTPException(403, "Access denied")
    student_id = current_user.get("user_id") or current_user.get("id")
    
    query = text("""
        SELECT c.id, c.course_name, c.course_code, c.credits, COALESCE(c.description, '') as description, d.department_name
        FROM courses c
        LEFT JOIN departments d ON c.department_id = d.id
        WHERE c.is_elective = 1 
          AND c.semester = :semester
          AND c.id NOT IN (
              SELECT course_id FROM enrollments WHERE student_id = :student_id AND semester = :semester
          )
        ORDER BY c.course_name
    """)
    rows = db.execute(query, {"semester": semester, "student_id": student_id}).fetchall()
    electives = [
        {
            "id": r[0],
            "name": r[1],
            "code": r[2],
            "credits": r[3],
            "description": r[4],
            "department": r[5] or "General"
        }
        for r in rows
    ]
    return {"electives": electives}

@router.get("/registered-electives")
async def get_registered_electives(
    semester: int = Query(..., description="Semester (1 or 2)"),
    db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    if current_user.get("role") != "student":
        raise HTTPException(403, "Access denied")
    student_id = current_user.get("user_id") or current_user.get("id")
    
    query = text("""
        SELECT course_id FROM enrollments 
        WHERE student_id = :student_id AND semester = :semester
    """)
    rows = db.execute(query, {"student_id": student_id, "semester": semester}).fetchall()
    elective_ids = [r[0] for r in rows]
    return {"elective_ids": elective_ids}

class ElectiveRegistration(BaseModel):
    semester: int
    elective_ids: List[int]

@router.post("/register-electives")
async def register_electives(
    payload: ElectiveRegistration,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    if current_user.get("role") != "student":
        raise HTTPException(403, "Access denied")
    student_id = current_user.get("user_id") or current_user.get("id")
    
    db.execute(text("DELETE FROM enrollments WHERE student_id = :sid AND semester = :sem"), 
               {"sid": student_id, "sem": payload.semester})
    for cid in payload.elective_ids:
        db.execute(text("""
            INSERT INTO enrollments (student_id, course_id, semester, academic_year, enrollment_date)
            VALUES (:sid, :cid, :sem, :year, CURDATE())
        """), {
            "sid": student_id,
            "cid": cid,
            "sem": payload.semester,
            "year": "2024/2025"
        })
    db.commit()
    return {"message": f"Registered {len(payload.elective_ids)} electives for Semester {payload.semester}"}