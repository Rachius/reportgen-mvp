from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import reports, profiles, auth, subscriptions, admin, consultations
from app.services.db_service import connect, disconnect

app = FastAPI(
    title="Reporti API",
    version="0.1.0",
    docs_url="/docs" if settings.environment == "development" else None
)

origins = [
    "http://localhost:5173",
    "https://reportgen-mvp.web.app",
    "https://reportgen-mvp.firebaseapp.com",
    "https://report-i.com",
    "https://www.report-i.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
app.include_router(subscriptions.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(consultations.router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}
