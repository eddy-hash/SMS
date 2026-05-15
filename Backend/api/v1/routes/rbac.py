from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from api.v1.core.database import get_db
from api.v1.dependencies.auth import (
    get_current_user, 
    require_admin, 
    require_principal, 
    require_hod, 
    require_teacher, 
    require_staff, 
    require_student,
    require_role
)

router = APIRouter(prefix="/rbac", tags=["RBAC"])

@router.get("/roles")
async def get_available_roles(current_user: Dict[str, Any] = Depends(require_admin)):
    """Get all available roles (admin only)"""
    return {
        "roles": [
            {"name": "admin", "level": 100, "description": "System Administrator"},
            {"name": "principal", "level": 90, "description": "University Principal"},
            {"name": "hod", "level": 85, "description": "Head of Department"},
            {"name": "dean", "level": 82, "description": "Dean of Faculty"},
            {"name": "registrar", "level": 80, "description": "Registrar"},
            {"name": "finance", "level": 75, "description": "Finance Officer"},
            {"name": "teacher", "level": 70, "description": "Teacher/Lecturer"},
            {"name": "lecturer", "level": 70, "description": "Lecturer"},
            {"name": "librarian", "level": 65, "description": "Librarian"},
            {"name": "staff", "level": 60, "description": "Administrative Staff"},
            {"name": "student", "level": 50, "description": "Student"},
            {"name": "parent", "level": 40, "description": "Parent/Guardian"},
            {"name": "alumni", "level": 30, "description": "Alumni"},
            {"name": "guest", "level": 10, "description": "Guest User"}
        ]
    }

@router.get("/my-permissions")
async def get_my_permissions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user's permissions"""
    user_role = current_user.get("role", "student")
    role_levels = {
        "admin": 100, "principal": 90, "hod": 85, "dean": 82,
        "registrar": 80, "finance": 75, "teacher": 70, "lecturer": 70,
        "librarian": 65, "staff": 60, "student": 50, "parent": 40,
        "alumni": 30, "guest": 10
    }
    
    return {
        "role": user_role,
        "level": role_levels.get(user_role, 0),
        "permissions": {
            "can_view_dashboard": True,
            "can_manage_users": user_role == "admin",
            "can_manage_courses": user_role in ["admin", "principal", "hod", "teacher"],
            "can_view_reports": user_role in ["admin", "principal", "hod", "teacher", "registrar"],
            "can_manage_fees": user_role in ["admin", "finance"],
            "can_manage_attendance": user_role in ["admin", "teacher", "lecturer"],
            "can_manage_results": user_role in ["admin", "teacher", "lecturer", "registrar"]
        }
    }

@router.get("/check-role/{role_name}")
async def check_role(
    role_name: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Check if user has a specific role"""
    allowed_roles = [role_name]
    role_checker = require_role(allowed_roles)
    try:
        result = await role_checker(current_user)
        return {
            "has_role": True,
            "role": role_name,
            "user": result
        }
    except HTTPException:
        raise HTTPException(status_code=403, detail=f"User does not have role: {role_name}")

@router.get("/admin-only")
async def admin_only_route(current_user: Dict[str, Any] = Depends(require_admin)):
    """Test endpoint for admin only"""
    return {"message": "You have admin access!", "user": current_user}

@router.get("/principal-only")
async def principal_only_route(current_user: Dict[str, Any] = Depends(require_principal)):
    """Test endpoint for principal only"""
    return {"message": "You have principal access!", "user": current_user}

@router.get("/hod-only")
async def hod_only_route(current_user: Dict[str, Any] = Depends(require_hod)):
    """Test endpoint for HOD only"""
    return {"message": "You have HOD access!", "user": current_user}

@router.get("/teacher-only")
async def teacher_only_route(current_user: Dict[str, Any] = Depends(require_teacher)):
    """Test endpoint for teacher only"""
    return {"message": "You have teacher access!", "user": current_user}

@router.get("/student-only")
async def student_only_route(current_user: Dict[str, Any] = Depends(require_student)):
    """Test endpoint for student only"""
    return {"message": "You have student access!", "user": current_user}

@router.get("/staff-only")
async def staff_only_route(current_user: Dict[str, Any] = Depends(require_staff)):
    """Test endpoint for staff only"""
    return {"message": "You have staff access!", "user": current_user}
