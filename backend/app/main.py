from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import reports

app = FastAPI(
    title="ReportGen API",
    version="0.1.0",
    docs_url="/docs" if settings.environment == "development" else None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router, prefix="/api")

@app.get("/health")
def health():
    return {
        "status": "ok",
        "environment": settings.environment,
        "version": "0.1.0"
    }