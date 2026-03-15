import os


class Settings:
	minio_endpoint: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
	minio_access_key: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
	minio_secret_key: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
	minio_secure: bool = os.getenv("MINIO_SECURE", "false").lower() == "true"
	minio_bucket_materials: str = os.getenv("MINIO_BUCKET_MATERIALS", "study-materials")


settings = Settings()
