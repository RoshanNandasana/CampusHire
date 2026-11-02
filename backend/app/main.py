import importlib
import json
import os
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

# ─── CORS ──────────────────────────────────────────────────────────────────────
# In production set CORS_ORIGINS env var on Render to a JSON array:
#   ["https://your-app.vercel.app", "https://your-custom-domain.com"]
_cors_env = os.getenv("CORS_ORIGINS", "")
_extra_origins: list[str] = []
if _cors_env:
    try:
        _extra_origins = json.loads(_cors_env)
    except json.JSONDecodeError:
        # Fallback: comma-separated string
        _extra_origins = [o.strip() for o in _cors_env.split(",") if o.strip()]

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    *_extra_origins,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.(vercel\.app|app\.github\.dev|github\.dev)",
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

# ─── Startup ───────────────────────────────────────────────────────────────────
_MINIO_ENABLED = bool(os.getenv("MINIO_ENDPOINT"))


@app.on_event("startup")
async def startup_event():
    """Ensure storage, tables, and seed data are ready on startup."""
    import asyncio

    # ── MinIO (optional — skip if not configured) ──
    if _MINIO_ENABLED:
        logger.info("Checking MinIO health…")
        for attempt in range(1, 11):
            try:
                minio_client.ensure_bucket(settings.minio_bucket_materials)
                logger.info(
                    f"✅ MinIO healthy — bucket '{settings.minio_bucket_materials}' ready"
                )
                break
            except Exception as exc:
                if attempt < 10:
                    logger.warning(
                        f"MinIO check failed (attempt {attempt}/10): {exc}. Retrying…"
                    )
                    await asyncio.sleep(1)
                else:
                    logger.error(
                        "❌ MinIO unavailable after 10 attempts. File serving degraded."
                    )
    else:
        logger.info("MINIO_ENDPOINT not set — skipping MinIO (file upload disabled).")

    # ── Database schema + seed ──
    logger.info("Running database bootstrap and seed check…")
    for attempt in range(1, 11):
        try:
            await seed_database()
            logger.info("✅ Database schema and seed data are ready")
            return
        except Exception as exc:
            if attempt < 10:
                logger.warning(
                    f"DB seed failed (attempt {attempt}/10): {exc}. Retrying…"
                )
                await asyncio.sleep(1)
            else:
                logger.error(
                    f"❌ DB seed failed after 10 attempts. API starts with no demo data: {exc}"
                )