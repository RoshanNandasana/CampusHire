from datetime import timedelta
from io import BytesIO

from minio import Minio
from minio.error import S3Error

from app.core.config import settings


_client = Minio(
	settings.minio_endpoint,
	access_key=settings.minio_access_key,
	secret_key=settings.minio_secret_key,
	secure=settings.minio_secure,
)


def get_minio_client() -> Minio:
	return _client


def ensure_bucket(bucket_name: str) -> None:
	if not _client.bucket_exists(bucket_name):
		_client.make_bucket(bucket_name)


def upload_bytes(bucket_name: str, object_name: str, data: bytes, content_type: str) -> str:
	ensure_bucket(bucket_name)
	_client.put_object(
		bucket_name,
		object_name,
		BytesIO(data),
		length=len(data),
		content_type=content_type,
	)
	return object_name


def delete_object(bucket_name: str, object_name: str) -> None:
	try:
		_client.remove_object(bucket_name, object_name)
	except S3Error:
		# Ignore missing object errors and keep DB state consistent.
		return


def list_objects(bucket_name: str, prefix: str = "") -> list[dict]:
	ensure_bucket(bucket_name)
	return [
		{
			"object_name": item.object_name,
			"size": item.size,
			"etag": item.etag,
			"last_modified": item.last_modified,
		}
		for item in _client.list_objects(bucket_name, prefix=prefix, recursive=True)
	]


def build_file_url(bucket_name: str, object_name: str) -> str:
	scheme = "https" if settings.minio_secure else "http"
	return f"{scheme}://{settings.minio_endpoint}/{bucket_name}/{object_name}"


def get_presigned_get_url(bucket_name: str, object_name: str, expires_hours: int = 24) -> str:
	ensure_bucket(bucket_name)
	return _client.presigned_get_object(
		bucket_name,
		object_name,
		expires=timedelta(hours=expires_hours),
	)


def get_object_bytes(bucket_name: str, object_name: str) -> tuple[bytes, str]:
	response = _client.get_object(bucket_name, object_name)
	try:
		data = response.read()
		content_type = response.headers.get("Content-Type", "application/octet-stream")
		return data, content_type
	finally:
		response.close()
		response.release_conn()
