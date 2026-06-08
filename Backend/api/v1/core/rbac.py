from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
import jwt
from typing import List, Optional
from datetime import datetime

from api.v1.core.config import settings
from api.v1.core.database import get_db


class Roles:
    STUDENT = "student"
    TEACHER = "teacher"
    LECTURER = "lecturer"
    HOD = "hod"
    DEAN = "dean"
    PRINCIPAL = "principal"
    ADMIN = "admin"
    STAFF = "staff"

# Role hierarchy levels (higher number = more permissions)
ROLE_HIERARCHY = {
    Roles.STUDENT: 1,
    Roles.TEACHER: 2,
    Roles.LECTURER: 3,
    Roles.STAFF: 3,
    Roles.HOD: 4,
    Roles.DEAN: 5,
    Roles.PRINCIPAL: 6,
    Roles.ADMIN: 7,
}

# Permission sets for different roles
PERMISSIONS = {
    Roles.ADMIN: [
        "create_user", "delete_user", "update_user", "view_all_users",
        "assign_roles", "view_all_courses", "create_course", "delete_course",
        "view_all_departments", "manage_departments", "view_system_logs",
        "manage_settings", "view_all_reports", "manage_notifications"
    ],
    Roles.PRINCIPAL: [
        "view_all_users", "view_all_courses", "create_course",
        "view_all_departments", "manage_departments", "view_all_reports",
        "approve_requests", "manage_notifications"
    ],
    Roles.DEAN: [
        "view_faculty_users", "view_faculty_courses", "approve_faculty_requests",
        "view_faculty_reports", "manage_faculty_notifications"
    ],
    Roles.HOD: [
        "view_department_users", "view_department_courses", "approve_department_requests",
        "view_department_reports", "manage_department_notifications"
    ],
    Roles.LECTURER: [
        "view_own_courses", "manage_own_courses", "view_enrolled_students",
        "record_grades", "view_own_schedule"
    ],
    Roles.TEACHER: [
        "view_own_courses", "manage_own_courses", "view_enrolled_students",
        "record_grades", "view_own_schedule", "upload_course_materials"
    ],
    Roles.STAFF: [
        "view_own_records", "update_own_profile", "view_schedule"
    ],
    Roles.STUDENT: [
        "view_own_profile", "update_own_profile", "view_own_courses",
        "view_own_grades", "view_own_schedule", "submit_assignments"
    ],
}


async def get_current_user(request, db: Session = Depends(get_db)):
    """Extract and validate current user from JWT token"""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("user_id")
        
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except ValueError:
                pass
       
        query = text("""
            SELECT u.id, u.email, u.role_id, r.name as role_name,
                   u.created_at, u.profile_image
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = :id
        """)
        user = db.execute(query, {"id": user_id}).first()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        role_name = user[3].lower() if user[3] else "student"
        
        profile_data = {}
        full_name = ""
        
        if role_name == "student":
            profile_query = text("""
                SELECT first_name, last_name, registration_number, year_of_study, department_id
                FROM students
                WHERE email = :email
            """)
            profile = db.execute(profile_query, {"email": user[1]}).first()
            if profile:
                full_name = f"{profile[0]} {profile[1]}"
                profile_data = {
                    "first_name": profile[0],
                    "last_name": profile[1],
                    "registration_number": profile[2],
                    "year_of_study": profile[3],
                    "department_id": profile[4]
                }
        
        elif role_name in ["teacher", "lecturer", "hod", "dean", "staff"]:
            profile_query = text("""
                SELECT first_name, last_name, staff_id, position, department_id
                FROM staff
                WHERE email = :email
            """)
            profile = db.execute(profile_query, {"email": user[1]}).first()
            if profile:
                full_name = f"{profile[0]} {profile[1]}"
                profile_data = {
                    "first_name": profile[0],
                    "last_name": profile[1],
                    "staff_id": profile[2],
                    "position": profile[3],
                    "department_id": profile[4]
                }
        
        elif role_name == "admin":
            profile_query = text("""
                SELECT full_name, username
                FROM admin
                WHERE email = :email
            """)
            profile = db.execute(profile_query, {"email": user[1]}).first()
            if profile:
                full_name = profile[0]
                profile_data = {
                    "full_name": profile[0],
                    "username": profile[1]
                }
        
        if not full_name:
            full_name = user[1].split('@')[0]
        
        return {
            "id": user[0],
            "email": user[1],
            "role_id": user[2],
            "role": role_name,
            "full_name": full_name,
            "profile": profile_data,
            "profile_image": user[5],
            "created_at": str(user[4]) if user[4] else None
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


def require_roles(required_roles: List[str]):
    """Dependency factory for requiring specific roles"""
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "student")
        
        if user_role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Insufficient permissions",
                    "required_roles": required_roles,
                    "your_role": user_role,
                    "message": f"Access denied. Required roles: {', '.join(required_roles)}. Your role: {user_role}"
                }
            )
        return current_user
    return role_checker

def require_minimum_role(min_role: str):
    """Dependency factory for requiring minimum role level"""
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "student")
        user_level = ROLE_HIERARCHY.get(user_role, 0)
        required_level = ROLE_HIERARCHY.get(min_role, 0)
        
        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Insufficient permissions",
                    "required_minimum_role": min_role,
                    "required_level": required_level,
                    "your_role": user_role,
                    "your_level": user_level,
                    "message": f"Access denied. Required minimum role: {min_role}. Your role: {user_role}"
                }
            )
        return current_user
    return role_checker

def require_permission(permission: str):
    """Dependency factory for checking specific permissions"""
    async def permission_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "student")
        user_permissions = PERMISSIONS.get(user_role, [])
        
        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Permission denied",
                    "required_permission": permission,
                    "your_role": user_role,
                    "message": f"You don't have permission to: {permission}"
                }
            )
        return current_user
    return permission_checker

def require_any_permission(permissions: List[str]):
    """Dependency factory for checking any of multiple permissions"""
    async def permission_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "student")
        user_permissions = PERMISSIONS.get(user_role, [])
        
        has_permission = any(p in user_permissions for p in permissions)
        
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Permission denied",
                    "required_permissions": permissions,
                    "your_role": user_role,
                    "message": f"You don't have any of the required permissions: {', '.join(permissions)}"
                }
            )
        return current_user
    return permission_checker

def require_all_permissions(permissions: List[str]):
    """Dependency factory for checking all of multiple permissions"""
    async def permission_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "student")
        user_permissions = PERMISSIONS.get(user_role, [])
        
        missing = [p for p in permissions if p not in user_permissions]
        
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Permission denied",
                    "required_permissions": permissions,
                    "missing_permissions": missing,
                    "your_role": user_role,
                    "message": f"You're missing required permissions: {', '.join(missing)}"
                }
            )
        return current_user
    return permission_checker

require_admin = require_roles([Roles.ADMIN])
require_principal = require_roles([Roles.PRINCIPAL, Roles.ADMIN])
require_dean = require_roles([Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN])
require_hod = require_roles([Roles.HOD, Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN])
require_teacher = require_roles([Roles.TEACHER, Roles.LECTURER, Roles.HOD, Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN])
require_lecturer = require_roles([Roles.LECTURER, Roles.HOD, Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN])
require_staff = require_roles([Roles.STAFF, Roles.TEACHER, Roles.LECTURER, Roles.HOD, Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN])
require_student = require_roles([Roles.STUDENT, Roles.TEACHER, Roles.LECTURER, Roles.HOD, Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN, Roles.STAFF])
require_any_authenticated = require_roles([
    Roles.STUDENT, Roles.TEACHER, Roles.LECTURER, 
    Roles.HOD, Roles.DEAN, Roles.PRINCIPAL, Roles.ADMIN, Roles.STAFF
])

require_minimum_admin = require_minimum_role(Roles.ADMIN)
require_minimum_principal = require_minimum_role(Roles.PRINCIPAL)
require_minimum_dean = require_minimum_role(Roles.DEAN)
require_minimum_hod = require_minimum_role(Roles.HOD)
require_minimum_teacher = require_minimum_role(Roles.TEACHER)
require_minimum_staff = require_minimum_role(Roles.STAFF)
require_minimum_student = require_minimum_role(Roles.STUDENT)

def has_role(current_user: dict, role: str) -> bool:
    """Check if user has a specific role"""
    return current_user.get("role") == role

def has_any_role(current_user: dict, roles: List[str]) -> bool:
    """Check if user has any of the specified roles"""
    user_role = current_user.get("role", "student")
    return user_role in roles

def has_permission(current_user: dict, permission: str) -> bool:
    """Check if user has a specific permission"""
    user_role = current_user.get("role", "student")
    user_permissions = PERMISSIONS.get(user_role, [])
    return permission in user_permissions

def get_user_role_level(current_user: dict) -> int:
    """Get user's role level"""
    user_role = current_user.get("role", "student")
    return ROLE_HIERARCHY.get(user_role, 0)

def can_access_resource(current_user: dict, resource_owner_id: int, resource_owner_role: str = None) -> bool:
    """Check if user can access a resource (for ownership checks)"""
    user_id = current_user.get("id")
    user_role = current_user.get("role")
    user_level = get_user_role_level(current_user)
    
    if user_role == Roles.ADMIN:
        return True
    if user_id == resource_owner_id:
        return True
    
    if resource_owner_role and user_role != Roles.STUDENT:
        owner_level = ROLE_HIERARCHY.get(resource_owner_role, 0)
       
        return user_level > owner_level
    
    return False


def check_permission(permission: str):
    """Decorator for permission checking"""
    def decorator(func):
        async def wrapper(*args, current_user: dict = Depends(get_current_user), **kwargs):
            if not has_permission(current_user, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: {permission}"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator


async def get_user_details(user_id: int, db: Session):
    """Get complete user details including role-specific profile"""
    query = text("""
        SELECT u.id, u.email, u.role_id, r.name as role_name,
               u.created_at, u.profile_image
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = :id
    """)
    user = db.execute(query, {"id": user_id}).first()
    
    if not user:
        return None
    
    role_name = user[3].lower() if user[3] else "student"
    
    profile = None
    if role_name == "student":
        profile = db.execute(
            text("SELECT * FROM students WHERE email = :email"),
            {"email": user[1]}
        ).first()
    elif role_name in ["teacher", "lecturer", "hod", "dean", "staff"]:
        profile = db.execute(
            text("SELECT * FROM staff WHERE email = :email"),
            {"email": user[1]}
        ).first()
    elif role_name == "admin":
        profile = db.execute(
            text("SELECT * FROM admin WHERE email = :email"),
            {"email": user[1]}
        ).first()
    
    return {
        "id": user[0],
        "email": user[1],
        "role_id": user[2],
        "role": role_name,
        "profile": dict(profile._mapping) if profile else None,
        "profile_image": user[5],
        "created_at": user[4]
    }

