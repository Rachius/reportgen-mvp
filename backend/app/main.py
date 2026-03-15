from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import reports, profiles, auth
from app.services.db_service import connect, disconnect

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

@app.on_event("startup")
async def startup():
    await connect()

@app.on_event("shutdown")
async def shutdown():
    await disconnect()

app.include_router(reports.router, prefix="/api")
app.include_router(profiles.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

@app.get("/health")
def health():
    return {
        "status": "ok",
        "environment": settings.environment,
        "version": "0.1.0"
    }