import importlib
import pkgutil
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models as _models_pkg

# Import all ORM models so SQLAlchemy can resolve all relationships at startup.
for _, _module_name, _ in pkgutil.iter_modules(_models_pkg.__path__):
    importlib.import_module(f"app.models.{_module_name}")

from app.api.v1.router import router
from app.storage import minio_client
from app.core.config import settings
from seed import seed_database

logger = logging.getLogger(__name__)

app = FastAPI(title="CampusHire", version="1.0.0")

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.(app\.github\.dev|github\.dev|thub\.dev)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "CampusHire API is running",
        "docs": "/docs",
        "openapi": "/openapi.json",
    }

app.include_router(router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Ensure MinIO, tables, and seed data are ready on startup."""
    logger.info("Starting up... Checking MinIO health")
    max_retries = 10
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Check if MinIO is accessible and create bucket if needed
            minio_client.ensure_bucket(settings.minio_bucket_materials)
            logger.info(f"✅ MinIO is healthy and bucket '{settings.minio_bucket_materials}' is ready")
            break
        except Exception as e:
            retry_count += 1
            if retry_count < max_retries:
                logger.warning(f"MinIO health check failed (attempt {retry_count}/{max_retries}): {e}. Retrying...")
                import asyncio
                await asyncio.sleep(1)
            else:
                logger.error(f"❌ MinIO failed to become healthy after {max_retries} attempts. File serving will fail.")
                # Don't raise - let the server start anyway with degraded file serving

    logger.info("Starting database bootstrap and seed check")
    retry_count = 0
    while retry_count < max_retries:
        try:
            await seed_database()
            logger.info("✅ Database schema and seed data are ready")
            return
        except Exception as e:
            retry_count += 1
            if retry_count < max_retries:
                logger.warning(
                    f"Database seed failed (attempt {retry_count}/{max_retries}): {e}. Retrying..."
                )
                import asyncio

                await asyncio.sleep(1)
            else:
                logger.error(
                    f"❌ Database seed failed after {max_retries} attempts. The API may start without demo data: {e}"
                )