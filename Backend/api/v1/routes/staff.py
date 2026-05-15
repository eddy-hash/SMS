from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from api.v1.core.database import get_db
from api.v1.core.dependencies import get_current_user
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter(prefix="/staff", tags=["Staff"])

class StaffCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    department_id: Optional[int] = None
    position: Optional[str] = None
    role: str = "STAFF"
    hire_date: Optional[str] = None
    full_name: Optional[str] = None
    qualification: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True

class StaffUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    position: Optional[str] = None
    role: Optional[str] = None
    hire_date: Optional[str] = None
    full_name: Optional[str] = None
    qualification: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

def generate_staff_code(db: Session, role: str):
    from sqlalchemy import text
    role_codes = {
        "STAFF": "STAFF",
        "TEACHER": "TCH",
        "LECTURER": "LEC",
        "HOD": "HOD",
        "DEAN": "DEAN",
        "ADMIN": "ADM",
        "PRINCIPAL": "PRN",
        "BURSAR": "BUR"
    }
    role_code = role_codes.get(role.upper(), role.upper()[:4])
    result = db.execute(text("SELECT staff_code FROM staff WHERE staff_code LIKE :pattern ORDER BY id DESC LIMIT 1"), 
                        {"pattern": f"EAU/{role_code}/%"}).first()
    if result and result[0]:
        new_num = int(result[0].split('/')[-1]) + 1
    else:
        new_num = 1
    return f"EAU/{role_code}/{new_num:04d}"

def check_duplicate_staff(db: Session, staff_id: Optional[int] = None, first_name: str = None, last_name: str = None, email: str = None):
    from sqlalchemy import text
    
    if first_name and last_name:
        dup = db.execute(text("SELECT id,first_name,last_name,email,staff_code FROM staff WHERE first_name=:fn AND last_name=:ln AND is_active=1"), 
                         {"fn": first_name, "ln": last_name}).first()
        if dup and (staff_id is None or dup[0] != staff_id):
            return {"field": "name", "message": f"Staff '{first_name} {last_name}' already exists", 
                    "existing": {"id": dup[0], "name": f"{dup[1]} {dup[2]}", "email": dup[3], "staff_code": dup[4]}}
    
    if email:
        dup = db.execute(text("SELECT id,first_name,last_name,email,staff_code FROM staff WHERE email=:em AND is_active=1"), 
                         {"em": email}).first()
        if dup and (staff_id is None or dup[0] != staff_id):
            return {"field": "email", "message": f"Email '{email}' already exists", 
                    "existing": {"id": dup[0], "name": f"{dup[1]} {dup[2]}", "email": dup[3], "staff_code": dup[4]}}
    return None

@router.get("/list")
async def get_staff_list(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500), 
                         department_id: Optional[int] = None, db: Session = Depends(get_db), 
                         current_user = Depends(get_current_user)):
    from sqlalchemy import text
    query = """SELECT id, user_id, staff_code, first_name, last_name, email, phone, department_id, 
                      position, hire_date, full_name, created_at, is_active, role, qualification, address 
               FROM staff WHERE is_active=1"""
    params = {}
    if department_id:
        query += " AND department_id = :dept_id"
        params["dept_id"] = department_id
    query += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    params.update({"limit": limit, "skip": skip})
    
    result = db.execute(text(query), params)
    return [{"id": r[0], "user_id": r[1], "staff_code": r[2], "first_name": r[3], "last_name": r[4],
             "full_name": r[10] or f"{r[3]} {r[4]}", "email": r[5], "phone": r[6], "department_id": r[7],
             "position": r[8], "hire_date": str(r[9]) if r[9] else None, "role": r[13], "is_active": r[12],
             "qualification": r[14] if len(r) > 14 else None, "address": r[15] if len(r) > 15 else None,
             "created_at": str(r[11]) if r[11] else None} for r in result]

@router.get("/stats")
async def get_staff_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from sqlalchemy import text
    
    total_result = db.execute(text("SELECT COUNT(*) FROM staff WHERE is_active = 1"))
    total = total_result.scalar() or 0
    
    teachers_result = db.execute(text("""
        SELECT COUNT(*) FROM staff 
        WHERE is_active = 1 AND role IN ('TEACHER', 'LECTURER', 'TCH', 'LEC')
    """))
    teachers = teachers_result.scalar() or 0
    
    admin_result = db.execute(text("""
        SELECT COUNT(*) FROM staff 
        WHERE is_active = 1 AND role IN ('ADMIN', 'ADM', 'STAFF')
    """))
    administrative = admin_result.scalar() or 0
    
    leadership_result = db.execute(text("""
        SELECT COUNT(*) FROM staff 
        WHERE is_active = 1 AND role IN ('HOD', 'DEAN', 'PRINCIPAL', 'PRN')
    """))
    leadership = leadership_result.scalar() or 0
    
    bursar_result = db.execute(text("""
        SELECT COUNT(*) FROM staff 
        WHERE is_active = 1 AND role IN ('BURSAR', 'BUR')
    """))
    bursars = bursar_result.scalar() or 0
    
    dept_result = db.execute(text("SELECT COUNT(*) FROM departments"))
    departments = dept_result.scalar() or 0
    
    current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month = (current_month - timedelta(days=1)).replace(day=1)
    
    new_staff = db.execute(
        text("SELECT COUNT(*) FROM staff WHERE created_at >= :start_date AND is_active = 1"),
        {"start_date": current_month}
    ).scalar() or 0
    
    last_month_staff = db.execute(
        text("SELECT COUNT(*) FROM staff WHERE created_at >= :start_date AND created_at < :end_date AND is_active = 1"),
        {"start_date": last_month, "end_date": current_month}
    ).scalar() or 0
    
    total_percentage = 0
    if last_month_staff > 0:
        total_percentage = round(((new_staff - last_month_staff) / last_month_staff) * 100, 1)
    elif new_staff > 0:
        total_percentage = 100
    
    new_teachers = db.execute(
        text("""SELECT COUNT(*) FROM staff WHERE created_at >= :start_date 
                AND is_active = 1 AND role IN ('TEACHER', 'LECTURER', 'TCH', 'LEC')"""),
        {"start_date": current_month}
    ).scalar() or 0
    
    last_month_teachers = db.execute(
        text("""SELECT COUNT(*) FROM staff WHERE created_at >= :start_date AND created_at < :end_date 
                AND is_active = 1 AND role IN ('TEACHER', 'LECTURER', 'TCH', 'LEC')"""),
        {"start_date": last_month, "end_date": current_month}
    ).scalar() or 0
    
    teachers_percentage = 0
    if last_month_teachers > 0:
        teachers_percentage = round(((new_teachers - last_month_teachers) / last_month_teachers) * 100, 1)
    elif new_teachers > 0:
        teachers_percentage = 100
    
    new_admin = db.execute(
        text("""SELECT COUNT(*) FROM staff WHERE created_at >= :start_date 
                AND is_active = 1 AND role IN ('ADMIN', 'ADM', 'STAFF')"""),
        {"start_date": current_month}
    ).scalar() or 0
    
    last_month_admin = db.execute(
        text("""SELECT COUNT(*) FROM staff WHERE created_at >= :start_date AND created_at < :end_date 
                AND is_active = 1 AND role IN ('ADMIN', 'ADM', 'STAFF')"""),
        {"start_date": last_month, "end_date": current_month}
    ).scalar() or 0
    
    admin_percentage = 0
    if last_month_admin > 0:
        admin_percentage = round(((new_admin - last_month_admin) / last_month_admin) * 100, 1)
    elif new_admin > 0:
        admin_percentage = 100
    
    return {
        "total": total,
        "teachers": teachers,
        "administrative": administrative,
        "leadership": leadership,
        "bursars": bursars,
        "departments": departments,
        "total_percentage": total_percentage,
        "teachers_percentage": teachers_percentage,
        "administrative_percentage": admin_percentage,
        "departments_percentage": 0
    }

@router.get("/deleted/list")
async def get_deleted_staff(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from sqlalchemy import text
    
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    if user_role not in ["admin", "principal"]:
        raise HTTPException(403, "Only administrators can view deleted staff")
    
    query = """SELECT id, user_id, staff_code, first_name, last_name, email, phone, department_id, 
                      position, hire_date, full_name, created_at, is_active, role, qualification, address, deleted_at
               FROM staff WHERE is_active = 0 ORDER BY deleted_at DESC LIMIT :limit OFFSET :skip"""
    
    params = {"limit": limit, "skip": skip}
    
    result = db.execute(text(query), params)
    
    return [{
        "id": r[0],
        "user_id": r[1],
        "staff_code": r[2],
        "first_name": r[3],
        "last_name": r[4],
        "full_name": r[10] or f"{r[3]} {r[4]}",
        "email": r[5],
        "phone": r[6],
        "department_id": r[7],
        "position": r[8],
        "hire_date": str(r[9]) if r[9] else None,
        "role": r[13],
        "is_active": r[12],
        "qualification": r[14] if len(r) > 14 else None,
        "address": r[15] if len(r) > 15 else None,
        "created_at": str(r[11]) if r[11] else None,
        "deleted_at": str(r[16]) if len(r) > 16 and r[16] else None
    } for r in result]

@router.get("/{staff_id}")
async def get_staff(staff_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from sqlalchemy import text
    r = db.execute(text("""SELECT id, user_id, staff_code, first_name, last_name, email, phone, department_id, 
                           position, hire_date, full_name, created_at, is_active, role, qualification, address 
                           FROM staff WHERE id=:id AND is_active=1"""), 
                   {"id": staff_id}).first()
    if not r:
        raise HTTPException(404, "Staff member not found")
    return {"id": r[0], "user_id": r[1], "staff_code": r[2], "first_name": r[3], "last_name": r[4],
            "full_name": r[10] or f"{r[3]} {r[4]}", "email": r[5], "phone": r[6], "department_id": r[7],
            "position": r[8], "hire_date": str(r[9]) if r[9] else None, "role": r[13], "is_active": r[12],
            "qualification": r[14] if len(r) > 14 else None, "address": r[15] if len(r) > 15 else None,
            "created_at": str(r[11]) if r[11] else None}

@router.post("/create", status_code=201)
async def create_staff(staff: StaffCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from sqlalchemy import text
    
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    if user_role not in ["admin", "principal"]:
        raise HTTPException(403, "Only administrators can add staff")
    
    dup = check_duplicate_staff(db, first_name=staff.first_name, last_name=staff.last_name, email=staff.email)
    if dup:
        raise HTTPException(409, dup)
    
    full_name = staff.full_name or f"{staff.first_name} {staff.last_name}"
    staff_code = generate_staff_code(db, staff.role)
    
    db.execute(text("""INSERT INTO staff (staff_code, first_name, last_name, email, phone, department_id, 
                       position, hire_date, full_name, role, qualification, address, is_active) 
               VALUES (:code, :fn, :ln, :em, :ph, :dept, :pos, :hdate, :fname, :role, :qual, :addr, :active)"""),
               {"code": staff_code, "fn": staff.first_name, "ln": staff.last_name, "em": staff.email,
                "ph": staff.phone, "dept": staff.department_id, "pos": staff.position,
                "hdate": staff.hire_date, "fname": full_name, "role": staff.role,
                "qual": staff.qualification, "addr": staff.address, "active": staff.is_active})
    db.commit()
    new_id = db.execute(text("SELECT LAST_INSERT_ID()")).first()[0]
    return await get_staff(new_id, db, current_user)

@router.put("/{staff_id}")
async def update_staff(staff_id: int, staff: StaffUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from sqlalchemy import text
    
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    if user_role not in ["admin", "principal"]:
        raise HTTPException(403, "Only administrators can update staff")
    
    existing = db.execute(text("SELECT id,first_name,last_name,email FROM staff WHERE id=:id"), {"id": staff_id}).first()
    if not existing:
        raise HTTPException(404, "Staff member not found")
    
    new_fn = staff.first_name if staff.first_name is not None else existing[1]
    new_ln = staff.last_name if staff.last_name is not None else existing[2]
    new_email = staff.email if staff.email is not None else existing[3]
    
    dup = check_duplicate_staff(db, staff_id, new_fn, new_ln, new_email)
    if dup:
        raise HTTPException(409, dup)
    
    updates, params = [], {"id": staff_id}
    for field in ['first_name', 'last_name', 'email', 'phone', 'department_id', 'position', 'role', 'hire_date', 'full_name', 'qualification', 'address', 'is_active']:
        val = getattr(staff, field, None)
        if val is not None:
            updates.append(f"{field}=:{field}")
            params[field] = val
    
    if staff.first_name is not None or staff.last_name is not None:
        updates.append("full_name=:full_name")
        params["full_name"] = f"{new_fn} {new_ln}"
    
    if updates:
        db.execute(text(f"UPDATE staff SET {', '.join(updates)} WHERE id=:id"), params)
        db.commit()
    return await get_staff(staff_id, db, current_user)

@router.delete("/{staff_id}", status_code=200)
async def delete_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Soft delete a staff member (default delete method)"""
    from sqlalchemy import text
    
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    if user_role not in ["admin", "principal"]:
        raise HTTPException(403, "Only administrators can delete staff")
    
    existing = db.execute(
        text("SELECT id, first_name, last_name, staff_code, is_active FROM staff WHERE id = :id"), 
        {"id": staff_id}
    ).first()
    
    if not existing:
        raise HTTPException(404, "Staff member not found")
    
    if existing[4] == 0:
        raise HTTPException(400, "Staff member is already deleted")
    
    db.execute(
        text("UPDATE staff SET is_active = 0, deleted_at = CURRENT_TIMESTAMP WHERE id = :id"), 
        {"id": staff_id}
    )
    db.commit()
    
    return {
        "success": True,
        "message": f"Staff member '{existing[1]} {existing[2]}' (ID: {existing[3]}) has been deleted",
        "deleted_id": staff_id
    }

@router.delete("/{staff_id}/soft", status_code=200)
async def soft_delete_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Soft delete a staff member (set is_active = 0)"""
    from sqlalchemy import text
    
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    if user_role not in ["admin", "principal"]:
        raise HTTPException(403, "Only administrators can delete staff")
    
    existing = db.execute(
        text("SELECT id, first_name, last_name, staff_code, is_active FROM staff WHERE id = :id"), 
        {"id": staff_id}
    ).first()
    
    if not existing:
        raise HTTPException(404, "Staff member not found")
    
    if existing[4] == 0:
        raise HTTPException(400, "Staff member is already deleted")
    
    db.execute(
        text("UPDATE staff SET is_active = 0, deleted_at = CURRENT_TIMESTAMP WHERE id = :id"), 
        {"id": staff_id}
    )
    db.commit()
    
    return {
        "success": True,
        "message": f"Staff member '{existing[1]} {existing[2]}' (ID: {existing[3]}) has been soft deleted",
        "deleted_id": staff_id,
        "soft_delete": True
    }

@router.delete("/{staff_id}/hard", status_code=204)
async def hard_delete_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Permanently delete a staff member from the database"""
    from sqlalchemy import text
    
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    if user_role not in ["admin", "principal"]:
        raise HTTPException(403, "Only administrators can permanently delete staff")
    
    existing = db.execute(text("SELECT id, first_name, last_name, staff_code FROM staff WHERE id = :id"), {"id": staff_id}).first()
    if not existing:
        raise HTTPException(404, "Staff member not found")
    
    db.execute(text("DELETE FROM staff WHERE id = :id"), {"id": staff_id})
    db.commit()
    
    return None

@router.post("/{staff_id}/restore", status_code=200)
async def restore_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Restore a soft-deleted staff member"""
    from sqlalchemy import text
    
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    if user_role not in ["admin", "principal"]:
        raise HTTPException(403, "Only administrators can restore staff")
    
    existing = db.execute(
        text("SELECT id, first_name, last_name, staff_code, is_active FROM staff WHERE id = :id"), 
        {"id": staff_id}
    ).first()
    
    if not existing:
        raise HTTPException(404, "Staff member not found")
    
    if existing[4] == 1:
        raise HTTPException(400, "Staff member is already active")
    
    db.execute(
        text("UPDATE staff SET is_active = 1, deleted_at = NULL WHERE id = :id"), 
        {"id": staff_id}
    )
    db.commit()
    
    return {
        "success": True,
        "message": f"Staff member '{existing[1]} {existing[2]}' (ID: {existing[3]}) has been restored",
        "restored_id": staff_id
    }