from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any, Optional
from api.v1.core.database import BaseRepository

class RBACService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BaseRepository(db)
    
    def get_user_roles(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all roles for a user from your existing tables"""
        query = """
            SELECT r.id as role_id, r.name as role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = :user_id
        """
        result = self.repo.execute_query(query, {"user_id": user_id})
        
        if not result:
            return [{"role_id": 1, "role_name": "student", "description": "Student User"}]
        
        return result
    
    def get_user_permissions(self, user_id: int) -> List[str]:
        """Get all permissions for a user based on their role"""
        query = """
            SELECT r.name as role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = :user_id
        """
        result = self.repo.execute_one(query, {"user_id": user_id})
        
        if not result:
            return []
        
        role_name = result.get("role_name", "student")
        
        # Define permissions based on role
        permissions_map = {
            "admin": [
                "users:view", "users:create", "users:edit", "users:delete",
                "students:view", "students:create", "students:edit", "students:delete",
                "teachers:view", "teachers:create", "teachers:edit", "teachers:delete",
                "courses:view", "courses:create", "courses:edit", "courses:delete",
                "departments:view", "departments:create", "departments:edit", "departments:delete",
                "results:view", "results:upload", "results:edit", "results:delete",
                "attendance:view", "attendance:mark", "attendance:edit",
                "reports:view", "reports:generate",
                "settings:manage", "settings:view",
                "dashboard:view", "analytics:view"
            ],
            "teacher": [
                "students:view",
                "courses:view",
                "results:view", "results:upload",
                "attendance:view", "attendance:mark",
                "reports:view",
                "dashboard:view"
            ],
            "student": [
                "profile:view", "profile:edit",
                "courses:view",
                "results:view",
                "attendance:view",
                "dashboard:view"
            ]
        }
        
        return permissions_map.get(role_name, permissions_map.get("student", []))
    
    def user_has_permission(self, user_id: int, permission: str) -> bool:
        """Check if user has a specific permission"""
        permissions = self.get_user_permissions(user_id)
        return permission in permissions
    
    def get_all_roles(self) -> List[Dict[str, Any]]:
        """Get all roles from your existing roles table"""
        try:
            query = "SELECT id as role_id, name as role_name FROM roles ORDER BY id"
            return self.repo.execute_query(query)
        except:
            return [
                {"role_id": 1, "role_name": "admin", "description": "Administrator"},
                {"role_id": 2, "role_name": "teacher", "description": "Teacher"},
                {"role_id": 3, "role_name": "student", "description": "Student User"}
            ]
    
    def get_role_by_id(self, role_id: int) -> Optional[Dict[str, Any]]:
        """Get role by ID"""
        try:
            query = "SELECT id as role_id, name as role_name FROM roles WHERE id = :id"
            return self.repo.execute_one(query, {"id": role_id})
        except:
            if role_id == 1:
                return {"role_id": 1, "role_name": "admin", "description": "Administrator"}
            elif role_id == 2:
                return {"role_id": 2, "role_name": "teacher", "description": "Teacher"}
            else:
                return {"role_id": 3, "role_name": "student", "description": "Student User"}
    
    def get_users_with_roles(self) -> List[Dict[str, Any]]:
        """Get all users with their roles"""
        query = """
            SELECT u.id, u.username, u.email, u.is_active,
                   r.name as role_name, r.id as role_id
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            ORDER BY u.id
        """
        return self.repo.execute_query(query)
    
    def assign_role_to_user(self, user_id: int, role_id: int) -> bool:
        """Assign a role to a user"""
        try:
            query = "UPDATE users SET role_id = :role_id WHERE id = :user_id"
            self.repo.execute_write(query, {"user_id": user_id, "role_id": role_id})
            return True
        except Exception as e:
            print(f"Error assigning role: {e}")
            return False
    
    def remove_role_from_user(self, user_id: int, role_id: int = None) -> bool:
        """Remove role from user (set to null or default role)"""
        try:
            # Set to null or default student role (role_id = 3)
            query = "UPDATE users SET role_id = 3 WHERE id = :user_id"
            self.repo.execute_write(query, {"user_id": user_id})
            return True
        except Exception as e:
            print(f"Error removing role: {e}")
            return False
    
    def get_user_role(self, user_id: int) -> Optional[str]:
        """Get user's role name"""
        query = """
            SELECT r.name as role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = :user_id
        """
        result = self.repo.execute_one(query, {"user_id": user_id})
        return result.get("role_name") if result else None
    
    def has_role(self, user_id: int, role_name: str) -> bool:
        """Check if user has a specific role"""
        user_role = self.get_user_role(user_id)
        return user_role == role_name
    
    def get_users_by_role(self, role_name: str) -> List[Dict[str, Any]]:
        """Get all users with a specific role"""
        query = """
            SELECT u.id, u.username, u.email, u.is_active
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE r.name = :role_name
            ORDER BY u.username
        """
        return self.repo.execute_query(query, {"role_name": role_name})
