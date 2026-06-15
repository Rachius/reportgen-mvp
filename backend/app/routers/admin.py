from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from app.services.auth_service import verify_admin
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


class AnswerBody(BaseModel):
    response: str


@router.get("/metrics")
async def metrics(claims: dict = Depends(verify_admin)):
    return await admin_service.get_metrics()


@router.get("/users")
async def users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    claims: dict = Depends(verify_admin),
):
    return await admin_service.get_users(page=page, limit=limit)


@router.put("/users/{user_id}/approve")
async def approve_user(user_id: str, claims: dict = Depends(verify_admin)):
    await admin_service.approve_user(user_id)
    return {"ok": True}


@router.put("/users/{user_id}/block")
async def block_user(user_id: str, claims: dict = Depends(verify_admin)):
    await admin_service.block_user(user_id)
    return {"ok": True}


@router.get("/consultations")
async def consultations(
    status: str = Query(None),
    claims: dict = Depends(verify_admin),
):
    return await admin_service.get_consultations(status=status)


@router.put("/consultations/{consultation_id}/answer")
async def answer_consultation(
    consultation_id: str,
    body: AnswerBody,
    claims: dict = Depends(verify_admin),
):
    await admin_service.answer_consultation(consultation_id, body.response)
    return {"ok": True}


@router.get("/reports")
async def reports(claims: dict = Depends(verify_admin)):
    return await admin_service.get_recent_reports()


@router.put("/users/{user_id}/plan")
async def set_user_plan(
    user_id: str,
    body: dict,
    claims: dict = Depends(verify_admin),
):
    from app.services.db_service import database
    plan = body.get("plan", "free")
    reports_limit = 10 if plan == "starter" else 3
    consultations_limit = 3 if plan == "starter" else 0
    await database.execute(
        """
        UPDATE subscriptions
        SET plan = :plan,
            reports_limit = :reports_limit,
            consultations_limit = :consultations_limit,
            status = 'active',
            updated_at = NOW()
        WHERE user_id = :user_id
        """,
        values={
            "plan": plan,
            "reports_limit": reports_limit,
            "consultations_limit": consultations_limit,
            "user_id": user_id,
        },
    )
    return {"status": "ok", "plan": plan}
