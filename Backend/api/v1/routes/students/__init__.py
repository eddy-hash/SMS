from fastapi import APIRouter
from .list import router as list_router
from .detail import router as detail_router
from .create import router as create_router
from .update import router as update_router
from .delete import router as delete_router
from .result import router as result_router


router = APIRouter()
router.include_router(list_router)
router.include_router(detail_router)
router.include_router(create_router)
router.include_router(update_router)
router.include_router(delete_router)
router.include_router(result_router)


__all__ = ['router']