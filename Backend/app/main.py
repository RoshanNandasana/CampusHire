import importlib
import pkgutil

from fastapi import FastAPI

import app.models as _models_pkg

# Import all ORM models so SQLAlchemy can resolve all relationships at startup.
for _, _module_name, _ in pkgutil.iter_modules(_models_pkg.__path__):
    importlib.import_module(f"app.models.{_module_name}")

from app.api.v1.router import router

app = FastAPI(title="CampusHire", version="1.0.0")
app.include_router(router, prefix="/api/v1")