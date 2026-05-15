from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from sqlalchemy.orm import Session
from sqlalchemy import text

from api.v1.core.config import settings
from api.v1.core.database import get_db
from api.v1.dependencies.auth import get_current_user, require_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
    message: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_profile_image(db: Session, user_id: int, user_type: str):
    result = db.execute(text("""
        SELECT image_path FROM profile_images 
        WHERE user_id = :user_id AND user_type = :user_type AND is_active = TRUE
        ORDER BY created_at DESC LIMIT 1
    """), {"user_id": user_id, "user_type": user_type}).first()
    return result[0] if result else None

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    try:
        print(f"=== LOGIN ATTEMPT === Username: {login_data.username}")
        
        admin_query = text("""
            SELECT id, username, email, password_hash, full_name, role_id
            FROM admin 
            WHERE username = :username OR email = :username
        """)
        
        admin_user = db.execute(admin_query, {"username": login_data.username}).first()
        
        if admin_user:
            print(f"Admin found: {admin_user[1]}")
            if pwd_context.verify(login_data.password, admin_user[3]):
                profile_image = get_profile_image(db, admin_user[0], "admin")
                access_token = create_access_token({
                    "sub": str(admin_user[0]),
                    "user_id": admin_user[0],
                    "email": admin_user[2],
                    "username": admin_user[1],
                    "role_id": admin_user[5] or 1,
                    "role": "admin",
                    "full_name": admin_user[4] or admin_user[1]
                })
                
                return LoginResponse(
                    access_token=access_token,
                    token_type="bearer",
                    user={
                        "id": admin_user[0],
                        "username": admin_user[1],
                        "email": admin_user[2],
                        "full_name": admin_user[4] or admin_user[1],
                        "role": "admin",
                        "role_id": admin_user[5] or 1,
                        "profile_image": profile_image
                    },
                    message=f"Welcome back, {admin_user[4] or admin_user[1]}!"
                )
        
        student_query = text("""
            SELECT id, registration_number, email, first_name, last_name, 
                   password, department_id, year_of_study, status
            FROM students 
            WHERE email = :username OR registration_number = :username
        """)
        
        student = db.execute(student_query, {"username": login_data.username}).first()
        
        if student:
            print(f"Student found: {student[3]} {student[4]}")
            if student[8] != 'active':
                print(f"Account disabled - status is: {student[8]}")
                raise HTTPException(401, "Account is disabled")
            
            if pwd_context.verify(login_data.password, student[5]):
                print("Password verified successfully")
                full_name = f"{student[3]} {student[4]}"
                profile_image = get_profile_image(db, student[0], "student")
                access_token = create_access_token({
                    "sub": str(student[0]),
                    "user_id": student[0],
                    "email": student[2],
                    "username": student[1],
                    "role_id": 3,
                    "role": "student",
                    "full_name": full_name
                })
                
                return LoginResponse(
                    access_token=access_token,
                    token_type="bearer",
                    user={
                        "id": student[0],
                        "username": student[1],
                        "email": student[2],
                        "full_name": full_name,
                        "role": "student",
                        "role_id": 3,
                        "registration_number": student[1],
                        "first_name": student[3],
                        "last_name": student[4],
                        "department_id": student[6],
                        "year_of_study": student[7],
                        "profile_image": profile_image
                    },
                    message=f"Welcome back, {full_name}!"
                )
            else:
                print("Password verification failed")
        else:
            print(f"No student found with username: {login_data.username}")
        
        print("Login failed")
        raise HTTPException(401, "Invalid username or password")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(401, "Invalid username or password")

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.get("id")
    role = current_user.get("role")
    user_type = "admin" if role == "admin" else "student"
    profile_image = get_profile_image(db, user_id, user_type) if user_id else None
    return {**current_user, "profile_image": profile_image}

@router.get("/protected")
async def protected_route(current_user: dict = Depends(require_admin)):
    return {"message": "Admin access granted!", "user": current_user}

@router.get("/test")
async def test():
    return {"message": "Auth route is working"}