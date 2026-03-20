import importlib
import pkgutil

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models as _models_pkg

# Import all ORM models so SQLAlchemy can resolve all relationships at startup.
for _, _module_name, _ in pkgutil.iter_modules(_models_pkg.__path__):
    importlib.import_module(f"app.models.{_module_name}")

from app.api.v1.router import router

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
    allow_origin_regex=r"https://.*\.app\.github\.dev",
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