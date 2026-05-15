from fastapi import APIRouter
from .stats import router as stats_router
from .overview import router as overview_router
from .trends import router as trends_router
from .departments import router as departments_router
from .performance import router as performance_router

router = APIRouter(prefix="/analytics", tags=["Analytics"])
router.include_router(stats_router)
router.include_router(overview_router)
router.include_router(trends_router)
router.include_router(departments_router)
router.include_router(performance_router)

__all__ = ['router']
