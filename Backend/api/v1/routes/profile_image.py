from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
import base64
import os
import uuid
import logging
from datetime import datetime
from PIL import Image
import io
from typing import Dict

from api.v1.core.database import get_db
from api.v1.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Profile Images"])
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
PROFILE_DIR = os.path.join(UPLOAD_DIR, "profile_images")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROFILE_DIR, exist_ok=True)

class ImageUpload(BaseModel):
    image_data: str

def optimize_image(image_bytes, target_size=(400, 400), quality=85):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        img.thumbnail(target_size, Image.Resampling.LANCZOS)
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        output.seek(0)
        return output.getvalue(), f"{img.width}x{img.height}"
    except Exception as e:
        logger.error(f"Image optimization error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

@router.post("/upload-profile-image")
async def upload_profile_image(
    payload: ImageUpload,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        if not payload.image_data:
            raise HTTPException(status_code=400, detail="No image provided")
        
        image_data = payload.image_data
        if 'base64,' in image_data:
            encoded = image_data.split('base64,')[1]
        elif ',' in image_data:
            encoded = image_data.split(',')[1]
        else:
            encoded = image_data
        
        encoded = encoded.strip().replace(' ', '+')
        image_bytes = base64.b64decode(encoded)
        
        if len(image_bytes) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image size must be less than 5MB")
        
        optimized_bytes, dimensions = optimize_image(image_bytes, target_size=(400, 400), quality=85)
        
        filename = f"{uuid.uuid4()}.jpg"
        file_path = os.path.join(PROFILE_DIR, filename)
        
        with open(file_path, "wb") as f:
            f.write(optimized_bytes)
        
        image_path = f"/uploads/profile_images/{filename}"
        
        logger.info(f"Image saved: {file_path}, dimensions: {dimensions}, size: {len(optimized_bytes)} bytes")
        
        user_role = current_user.get("role")
        user_type = "admin" if user_role == "admin" else "student"
        
        db.execute(text("""
            UPDATE profile_images 
            SET is_active = FALSE 
            WHERE user_id = :user_id AND user_type = :user_type AND is_active = TRUE
        """), {"user_id": user_id, "user_type": user_type})
        
        db.execute(text("""
            INSERT INTO profile_images (
                user_id, user_type, image_path, image_type, file_size, 
                original_filename, mime_type, dimensions, is_active, created_at
            ) VALUES (
                :user_id, :user_type, :image_path, :image_type, :file_size, 
                :original_filename, :mime_type, :dimensions, TRUE, NOW()
            )
        """), {
            "user_id": user_id,
            "user_type": user_type,
            "image_path": image_path,
            "image_type": "image/jpeg",
            "file_size": len(optimized_bytes),
            "original_filename": filename,
            "mime_type": "image/jpeg",
            "dimensions": dimensions
        })
        
        db.commit()
        
        return {
            "success": True,
            "message": "Profile image updated successfully",
            "profile_image": image_path,
            "dimensions": dimensions,
            "file_size": len(optimized_bytes)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/profile-image")
async def get_profile_image(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        user_role = current_user.get("role")
        user_type = "admin" if user_role == "admin" else "student"
        
        result = db.execute(text("""
            SELECT image_path, dimensions, file_size, created_at
            FROM profile_images 
            WHERE user_id = :user_id AND user_type = :user_type AND is_active = TRUE
            ORDER BY created_at DESC LIMIT 1
        """), {"user_id": user_id, "user_type": user_type}).fetchone()
        
        if result:
            return {
                "success": True,
                "profile_image": result[0],
                "dimensions": result[1],
                "file_size": result[2],
                "uploaded_at": result[3]
            }
        
        return {
            "success": False,
            "profile_image": None,
            "message": "No profile image found"
        }
        
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/profile-image")
async def delete_profile_image(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        user_role = current_user.get("role")
        user_type = "admin" if user_role == "admin" else "student"
        
        db.execute(text("""
            UPDATE profile_images 
            SET is_active = FALSE 
            WHERE user_id = :user_id AND user_type = :user_type AND is_active = TRUE
        """), {"user_id": user_id, "user_type": user_type})
        
        db.commit()
        
        return {
            "success": True,
            "message": "Profile image removed"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile-image-history")
async def get_profile_image_history(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        user_role = current_user.get("role")
        user_type = "admin" if user_role == "admin" else "student"
        
        result = db.execute(text("""
            SELECT id, image_path, dimensions, file_size, is_active, created_at
            FROM profile_images 
            WHERE user_id = :user_id AND user_type = :user_type
            ORDER BY created_at DESC
        """), {"user_id": user_id, "user_type": user_type})
        
        history = []
        for row in result:
            history.append({
                "id": row[0],
                "image_path": row[1],
                "dimensions": row[2],
                "file_size": row[3],
                "is_active": bool(row[4]),
                "created_at": str(row[5]) if row[5] else None
            })
        
        return {
            "success": True,
            "history": history
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))