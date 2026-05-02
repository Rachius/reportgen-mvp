from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, Depends
from fastapi.responses import Response
from app.models.schemas import GenerateResponse, StatusResponse, JobStatus
from app.services.file_service import parse_file
from app.services.claude_service import analyze_sales_data
from app.services.report_service import generate_pdf, generate_pptx
from app.services.auth_service import verify_token, get_or_create_user
from app.services.profile_service import get_profile
from app.services.subscription_service import can_generate_report, increment_report_usage
import uuid
import json

router = APIRouter()
jobs: dict = {}
files_store: dict = {}


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
        result = {
            'status': JobStatus.done,
            'progress': 100,
            'message': 'Listo',
            'pdf_url': None,
            'pptx_url': None,
        }

        if 'pdf' in formats:
            profile = file_data.get('company_profile', {})
            pdf_bytes = generate_pdf(analysis, file_data.get('report_type', 'ventas'), profile)
            files_store[f"{job_id}_pdf"] = pdf_bytes
            result['pdf_url'] = f"/api/reports/download/{job_id}/pdf"

        if 'pptx' in formats:
            profile = file_data.get('company_profile', {})
            pptx_bytes = generate_pptx(analysis, profile)
            files_store[f"{job_id}_pptx"] = pptx_bytes
            result['pptx_url'] = f"/api/reports/download/{job_id}/pptx"

        # Guardar en DB
        from app.services.db_service import database
        import uuid as uuid_lib
        await database.execute("""
            INSERT INTO reports (id, user_id, filename, report_type, formats, status, pdf_url, pptx_url)
            VALUES (:id, :user_id, :filename, :report_type, :formats, 'done', :pdf_url, :pptx_url)
        """, values={
            "id": str(uuid_lib.uuid4()),
            "user_id": str(file_data.get('user_id', '')),
            "filename": file_data.get('filename', ''),
            "report_type": file_data.get('report_type', 'ventas'),
            "formats": formats,
            "pdf_url": result.get('pdf_url', ''),
            "pptx_url": result.get('pptx_url', ''),
        })

        # Incrementar uso solo si el reporte se generó exitosamente
        try:
            await increment_report_usage(str(file_data.get('user_id', '')))
        except Exception:
            pass

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
    allowed, message = await can_generate_report(user["id"])
    if not allowed:
        from fastapi import HTTPException
        raise HTTPException(403, message)

    job_id = str(uuid.uuid4())
    formats_list = json.loads(formats)

    file_data = await parse_file(file)
    file_data['report_type'] = report_type

    profile = await get_profile(user["id"])
    file_data['company_profile'] = profile
    file_data['user_id'] = str(user["id"])

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


@router.get('/reports/download/{job_id}/pdf')
def download_pdf(job_id: str):
    key = f"{job_id}_pdf"
    if key not in files_store:
        from fastapi import HTTPException
        raise HTTPException(404, "Archivo no encontrado")
    return Response(
        content=files_store[key],
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=reporte_{job_id[:8]}.pdf"}
    )


@router.get('/reports/download/{job_id}/pptx')
def download_pptx(job_id: str):
    key = f"{job_id}_pptx"
    if key not in files_store:
        from fastapi import HTTPException
        raise HTTPException(404, "Archivo no encontrado")
    return Response(
        content=files_store[key],
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f"attachment; filename=reporte_{job_id[:8]}.pptx"}
    )