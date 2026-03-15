from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, Depends
from app.models.schemas import GenerateResponse, StatusResponse, JobStatus
from app.services.file_service import parse_file
from app.services.claude_service import analyze_sales_data
from app.services.report_service import generate_pdf, generate_pptx
from app.services.auth_service import verify_token, get_or_create_user
from app.services.profile_service import get_profile
import uuid
import json

router = APIRouter()
jobs: dict = {}

async def get_current_user(token_data: dict = Depends(verify_token)):
    return await get_or_create_user(
        firebase_uid=token_data["uid"],
        email=token_data.get("email", "")
    )

async def process_report(job_id: str, file_data: dict, formats: list):
    try:
        jobs[job_id].update({'progress': 30, 'message': 'Analizando datos con Claude...'})
        analysis = await analyze_sales_data(file_data)

        jobs[job_id].update({'progress': 60, 'message': 'Generando documentos...'})
        result = {'status': JobStatus.done, 'progress': 100, 'message': 'Listo'}

        if 'pdf' in formats:
            pdf_bytes = generate_pdf(analysis)
            result['pdf_url'] = f"data:application/pdf;base64,{__import__('base64').b64encode(pdf_bytes).decode()}"

        if 'pptx' in formats:
            pptx_bytes = generate_pptx(analysis)
            result['pptx_url'] = f"data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,{__import__('base64').b64encode(pptx_bytes).decode()}"

        jobs[job_id].update(result)

    except Exception as e:
        jobs[job_id].update({
            'status': JobStatus.error,
            'progress': 0,
            'message': f'Error: {str(e)}'
        })

@router.post('/reports/generate', response_model=GenerateResponse)
async def generate_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    report_type: str = Form(...),
    formats: str = Form(...),
    user=Depends(get_current_user)
):
    job_id = str(uuid.uuid4())
    formats_list = json.loads(formats)

    file_data = await parse_file(file)
    file_data['report_type'] = report_type

    profile = await get_profile(user["id"])
    file_data['company_profile'] = profile

    jobs[job_id] = {
        'status': JobStatus.processing,
        'progress': 15,
        'message': 'Archivo recibido, procesando...',
        'pdf_url': None,
        'pptx_url': None,
    }

    background_tasks.add_task(process_report, job_id, file_data, formats_list)
    return {'job_id': job_id}

@router.get('/reports/status/{job_id}', response_model=StatusResponse)
def get_status(job_id: str):
    if job_id not in jobs:
        return StatusResponse(
            job_id=job_id,
            status=JobStatus.error,
            progress=0,
            message='Job no encontrado'
        )
    job = jobs[job_id]
    return StatusResponse(job_id=job_id, **job)