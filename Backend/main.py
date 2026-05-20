from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from api.v1.core.config import settings
from api.v1.routes import (
    staff_router,
    dashboard_router,
    students_router,
    teachers_router,  # This already includes all teacher routes
    courses_router,
    results_router,
    departments_router,
    analytics_router,
    notifications_router,
    actions_router,
    rbac_router,
    profile_image_router,
    announcements_router,
    auth_router
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Static files setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

print(f"MAIN - BASE_DIR: {BASE_DIR}")
print(f"MAIN - UPLOAD_DIR: {UPLOAD_DIR}")

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Main routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(students_router, prefix="/api/v1")
app.include_router(teachers_router, prefix="/api/v1")  # This includes all teacher routes
app.include_router(courses_router, prefix="/api/v1")
app.include_router(results_router, prefix="/api/v1")
app.include_router(departments_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(actions_router, prefix="/api/v1")
app.include_router(rbac_router, prefix="/api/v1")
app.include_router(profile_image_router, prefix="/api/v1")
app.include_router(announcements_router, prefix="/api/v1")
app.include_router(staff_router, prefix="/api/v1")

from api.v1.routes.students.update import router as student_update_router
from api.v1.routes.student_dashboard import router as student_dashboard_router
from api.v1.routes.students.result import router as student_result_router
from api.v1.routes.students.create import router as student_create_router
from api.v1.routes.students.change_password import router as student_change_password_router

app.include_router(student_update_router, prefix="/api/v1")
app.include_router(student_dashboard_router, prefix="/api/v1")
app.include_router(student_result_router, prefix="/api/v1")
app.include_router(student_create_router, prefix="/api/v1/students")
app.include_router(student_change_password_router, prefix="/api/v1/students")



@app.get("/")
async def root():
    return {
        "message": "EAU API",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }