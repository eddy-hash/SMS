from fastapi import APIRouter

router = APIRouter()

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime
import pandas as pd
import uuid
import os
import shutil

from api.v1.core.database import get_db
from api.v1.dependencies.auth import require_teacher

router = APIRouter(prefix="/upload", tags=["Teacher Upload"])

def calculate_grade(marks: float) -> str:
    if marks >= 90:
        return "A+"
    elif marks >= 80:
        return "A"
    elif marks >= 75:
        return "A-"
    elif marks >= 70:
        return "B+"
    elif marks >= 65:
        return "B"
    elif marks >= 60:
        return "B-"
    elif marks >= 55:
        return "C+"
    elif marks >= 50:
        return "C"
    elif marks >= 45:
        return "C-"
    elif marks >= 40:
        return "D"
    else:
        return "F"

def calculate_gpa(grade: str) -> float:
    grade_map = {
        "A+": 4.0, "A": 4.0, "A-": 3.7,
        "B+": 3.3, "B": 3.0, "B-": 2.7,
        "C+": 2.3, "C": 2.0, "C-": 1.7,
        "D": 1.0, "F": 0.0
    }
    return grade_map.get(grade, 0.0)

@router.post("/results/file")
async def upload_results_file(
    file: UploadFile = File(...),
    academic_year: str = Form(...),
    semester: str = Form(...),
    exam_type: str = Form(...),
    current_user: Dict[str, Any] = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    teacher_id = current_user.get("id")
    if not teacher_id:
        raise HTTPException(400, "Teacher ID not found")
    
    allowed_extensions = ['.xlsx', '.xls', '.csv']
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {allowed_extensions}"
        )
    
    temp_file_path = f"temp_{uuid.uuid4()}_{file.filename}"
    upload_id = str(uuid.uuid4())
    processed_records = []
    failed_records = []
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        if file_extension in ['.xlsx', '.xls']:
            df = pd.read_excel(temp_file_path)
        else:
            df = pd.read_csv(temp_file_path)
        
        required_columns = ['student_id', 'course_id', 'marks']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing_columns}"
            )
        
        for idx, row in df.iterrows():
            try:
                student_id = int(row['student_id'])
                course_id = int(row['course_id'])
                marks = float(row['marks'])
                
                if not 0 <= marks <= 100:
                    failed_records.append({
                        "row": idx + 2,
                        "student_id": student_id,
                        "error": "Marks must be between 0 and 100"
                    })
                    continue
                
                grade = calculate_grade(marks)
                gpa_points = calculate_gpa(grade)
                
                result_query = text("""
                    INSERT INTO results (student_id, course_id, academic_year, semester, marks, grade, gpa_points, exam_type, uploaded_by, uploaded_at)
                    VALUES (:student_id, :course_id, :academic_year, :semester, :marks, :grade, :gpa_points, :exam_type, :uploaded_by, :uploaded_at)
                    ON DUPLICATE KEY UPDATE 
                        marks = VALUES(marks),
                        grade = VALUES(grade),
                        gpa_points = VALUES(gpa_points),
                        uploaded_by = VALUES(uploaded_by),
                        uploaded_at = VALUES(uploaded_at)
                """)
                
                db.execute(result_query, {
                    "student_id": student_id,
                    "course_id": course_id,
                    "academic_year": academic_year,
                    "semester": semester,
                    "marks": marks,
                    "grade": grade,
                    "gpa_points": gpa_points,
                    "exam_type": exam_type,
                    "uploaded_by": teacher_id,
                    "uploaded_at": datetime.now()
                })
                
                db.commit()
                
                processed_records.append({
                    "row": idx + 2,
                    "student_id": student_id,
                    "course_id": course_id,
                    "marks": marks,
                    "grade": grade
                })
                
            except Exception as e:
                failed_records.append({
                    "row": idx + 2,
                    "student_id": row.get('student_id', 'Unknown'),
                    "error": str(e)
                })
        
        log_query = text("""
            INSERT INTO upload_logs (upload_id, teacher_id, file_name, academic_year, semester, exam_type, total_records, successful_records, failed_records, uploaded_at)
            VALUES (:upload_id, :teacher_id, :file_name, :academic_year, :semester, :exam_type, :total, :successful, :failed, :uploaded_at)
        """)
        
        db.execute(log_query, {
            "upload_id": upload_id,
            "teacher_id": teacher_id,
            "file_name": file.filename,
            "academic_year": academic_year,
            "semester": semester,
            "exam_type": exam_type,
            "total": len(processed_records) + len(failed_records),
            "successful": len(processed_records),
            "failed": len(failed_records),
            "uploaded_at": datetime.now()
        })
        
        db.commit()
        
        return {
            "success": True,
            "upload_id": upload_id,
            "message": f"Successfully uploaded {len(processed_records)} records",
            "processed_records": len(processed_records),
            "failed_records": failed_records,
            "total_records": len(processed_records) + len(failed_records)
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.post("/results/single")
async def upload_single_result(
    student_id: int,
    course_id: int,
    academic_year: str,
    semester: str,
    marks: float,
    exam_type: str,
    current_user: Dict[str, Any] = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    teacher_id = current_user.get("id")
    if not teacher_id:
        raise HTTPException(400, "Teacher ID not found")
    
    if not 0 <= marks <= 100:
        raise HTTPException(400, "Marks must be between 0 and 100")
    
    grade = calculate_grade(marks)
    gpa_points = calculate_gpa(grade)
    
    result_query = text("""
        INSERT INTO results (student_id, course_id, academic_year, semester, marks, grade, gpa_points, exam_type, uploaded_by, uploaded_at)
        VALUES (:student_id, :course_id, :academic_year, :semester, :marks, :grade, :gpa_points, :exam_type, :uploaded_by, :uploaded_at)
        ON DUPLICATE KEY UPDATE 
            marks = VALUES(marks),
            grade = VALUES(grade),
            gpa_points = VALUES(gpa_points),
            uploaded_by = VALUES(uploaded_by),
            uploaded_at = VALUES(uploaded_at)
    """)
    
    db.execute(result_query, {
        "student_id": student_id,
        "course_id": course_id,
        "academic_year": academic_year,
        "semester": semester,
        "marks": marks,
        "grade": grade,
        "gpa_points": gpa_points,
        "exam_type": exam_type,
        "uploaded_by": teacher_id,
        "uploaded_at": datetime.now()
    })
    
    db.commit()
    
    return {
        "success": True,
        "message": "Result uploaded successfully",
        "result": {
            "student_id": student_id,
            "course_id": course_id,
            "academic_year": academic_year,
            "semester": semester,
            "marks": marks,
            "grade": grade,
            "exam_type": exam_type
        }
    }

@router.post("/results/bulk-json")
async def upload_bulk_json(
    results: List[Dict[str, Any]],
    current_user: Dict[str, Any] = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    teacher_id = current_user.get("id")
    if not teacher_id:
        raise HTTPException(400, "Teacher ID not found")
    
    upload_id = str(uuid.uuid4())
    processed = []
    failed = []
    
    for idx, item in enumerate(results):
        try:
            required = ['student_id', 'course_id', 'academic_year', 'semester', 'marks', 'exam_type']
            missing = [f for f in required if f not in item]
            if missing:
                failed.append({"index": idx, "error": f"Missing fields: {missing}"})
                continue
            
            if not 0 <= item['marks'] <= 100:
                failed.append({"index": idx, "error": "Marks must be between 0 and 100"})
                continue
            
            grade = calculate_grade(item['marks'])
            gpa_points = calculate_gpa(grade)
            
            result_query = text("""
                INSERT INTO results (student_id, course_id, academic_year, semester, marks, grade, gpa_points, exam_type, uploaded_by, uploaded_at)
                VALUES (:student_id, :course_id, :academic_year, :semester, :marks, :grade, :gpa_points, :exam_type, :uploaded_by, :uploaded_at)
                ON DUPLICATE KEY UPDATE 
                    marks = VALUES(marks),
                    grade = VALUES(grade),
                    gpa_points = VALUES(gpa_points),
                    uploaded_by = VALUES(uploaded_by),
                    uploaded_at = VALUES(uploaded_at)
            """)
            
            db.execute(result_query, {
                "student_id": item['student_id'],
                "course_id": item['course_id'],
                "academic_year": item['academic_year'],
                "semester": item['semester'],
                "marks": item['marks'],
                "grade": grade,
                "gpa_points": gpa_points,
                "exam_type": item['exam_type'],
                "uploaded_by": teacher_id,
                "uploaded_at": datetime.now()
            })
            
            processed.append(item)
            
        except Exception as e:
            failed.append({"index": idx, "error": str(e)})
    
    log_query = text("""
        INSERT INTO upload_logs (upload_id, teacher_id, file_name, total_records, successful_records, failed_records, uploaded_at)
        VALUES (:upload_id, :teacher_id, :file_name, :total, :successful, :failed, :uploaded_at)
    """)
    
    db.execute(log_query, {
        "upload_id": upload_id,
        "teacher_id": teacher_id,
        "file_name": "bulk_json_upload",
        "total": len(processed) + len(failed),
        "successful": len(processed),
        "failed": len(failed),
        "uploaded_at": datetime.now()
    })
    
    db.commit()
    
    return {
        "success": True,
        "upload_id": upload_id,
        "processed": len(processed),
        "failed": len(failed),
        "failed_records": failed
    }

@router.get("/logs")
async def get_upload_logs(
    current_user: Dict[str, Any] = Depends(require_teacher),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    teacher_id = current_user.get("id")
    if not teacher_id:
        raise HTTPException(400, "Teacher ID not found")
    
    query = text("""
        SELECT upload_id, file_name, academic_year, semester, exam_type, total_records, successful_records, failed_records, uploaded_at
        FROM upload_logs
        WHERE teacher_id = :teacher_id
        ORDER BY uploaded_at DESC
        LIMIT :limit OFFSET :offset
    """)
    
    logs = db.execute(query, {
        "teacher_id": teacher_id,
        "limit": limit,
        "offset": offset
    }).fetchall()
    
    return {
        "success": True,
        "total": len(logs),
        "logs": [
            {
                "upload_id": log[0],
                "file_name": log[1],
                "academic_year": log[2],
                "semester": log[3],
                "exam_type": log[4],
                "total_records": log[5],
                "successful": log[6],
                "failed": log[7],
                "uploaded_at": str(log[8])
            }
            for log in logs
        ]
    }
