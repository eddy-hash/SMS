from .auth import router as auth_router
from .dashboard import router as dashboard_router
from .students import router as students_router
from .courses import router as courses_router
from .results import router as results_router
from .departments import router as departments_router
from .notifications import router as notifications_router
from .actions import router as actions_router
from .rbac import router as rbac_router
from .analytics import router as analytics_router
from .profile_image import router as profile_image_router
from .announcements import router as announcements_router
from .staff import router as staff_router
from .teachers import router as teachers_router

__all__ = [
    'auth_router',
    'dashboard_router',
    'students_router',
    'courses_router',
    'results_router',
    'departments_router',
    'notifications_router',
    'actions_router',
    'rbac_router',
    'analytics_router',
    'profile_image_router',
    'announcements_router',
    'staff_router',
    'teachers_router'
]
