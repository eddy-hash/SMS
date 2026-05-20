from fastapi import APIRouter
from .teachers.detail import router as detail_router
from .teachers.create import router as create_router
from .teachers.delete import router as delete_router
from .teachers.list import router as list_router
from .teachers.update import router as update_router
from .teachers.upload import router as upload_router
from .teachers.password import router as password_router

router = APIRouter(prefix="/teacher")

router.include_router(detail_router)
router.include_router(create_router)
router.include_router(delete_router)
router.include_router(list_router)
router.include_router(update_router)
router.include_router(upload_router)
router.include_router(password_router)

__all__ = ['router']
