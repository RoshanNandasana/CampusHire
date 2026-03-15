from fastapi import APIRouter
from app.api.v1.routes import auth
from app.api.v1.routes import admin
from app.api.v1.routes import tpo
from app.api.v1.routes.health import router as health_router


router = APIRouter()
router.include_router(health_router)
router.include_router(auth.router)
router.include_router(admin.router)
router.include_router(tpo.router)