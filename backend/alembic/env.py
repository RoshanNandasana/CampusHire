from logging.config import fileConfig
import importlib
import pkgutil

from sqlalchemy import engine_from_config, pool

from alembic import context
from app.models.base import Base
import app.models as models_pkg

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import all model modules so metadata includes every table.
for _, module_name, _ in pkgutil.iter_modules(models_pkg.__path__):
    importlib.import_module(f"app.models.{module_name}")

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
