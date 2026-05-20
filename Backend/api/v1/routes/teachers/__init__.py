from fastapi import APIRouter
from .detail import router as detail_router
from .list import router as list_router
from .create import router as create_router
from .update import router as update_router
from .delete import router as delete_router
from .upload import router as upload_router
from .change_password import router as change_password_router

# Add /teacher prefix here
router = APIRouter(prefix="/teacher")

router.include_router(detail_router)
router.include_router(list_router)
router.include_router(create_router)
router.include_router(update_router)
router.include_router(delete_router)
router.include_router(upload_router)
router.include_router(change_password_router)

__all__ = ['router']
