import os


class Settings:
	minio_endpoint: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
	minio_access_key: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
	minio_secret_key: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
	minio_secure: bool = os.getenv("MINIO_SECURE", "false").lower() == "true"
	minio_bucket_materials: str = os.getenv("MINIO_BUCKET_MATERIALS", "study-materials")
	openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
	openrouter_model: str = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
	openrouter_base_url: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
	openrouter_site_url: str = os.getenv("OPENROUTER_SITE_URL", "")
	openrouter_app_name: str = os.getenv("OPENROUTER_APP_NAME", "CampusHire")


settings = Settings()
