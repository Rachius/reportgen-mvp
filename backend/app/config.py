from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    anthropic_api_key: str
    gcp_project_id: str
    gcs_bucket_name: str
    gcp_region: str
    database_url: str
    firebase_credentials_path: str = "/secrets/firebase/credentials.json"
    mp_access_token: str
    mp_public_key: str = ""
    mp_webhook_secret: str = ""
    app_base_url: str = "https://api.report-i.com"
    frontend_base_url: str = "https://report-i.com"
    environment: str = "development"
    max_file_size_mb: int = 10

    class Config:
        env_file = ".env"

settings = Settings()
