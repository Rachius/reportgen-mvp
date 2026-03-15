from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class ReportType(str, Enum):
    ventas = "ventas"
    finanzas = "finanzas"
    operaciones = "operaciones"

class JobStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    done = "done"
    error = "error"

class GenerateResponse(BaseModel):
    job_id: str

class StatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress: int
    message: str
    pdf_url: Optional[str] = None
    pptx_url: Optional[str] = None