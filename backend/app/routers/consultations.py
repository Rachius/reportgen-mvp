import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.auth_service import verify_token
from app.services.db_service import database

router = APIRouter(prefix="/consultations", tags=["consultations"])


class ConsultationBody(BaseModel):
    subject: str
    message: str


@router.post("")
async def send_consultation(body: ConsultationBody, claims: dict = Depends(verify_token)):
    firebase_uid = claims["uid"]

    user = await database.fetch_one(
        "SELECT id FROM users WHERE firebase_uid = :uid",
        values={"uid": firebase_uid},
    )
    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    user_id = str(user["id"])

    sub = await database.fetch_one(
        "SELECT plan, consultations_used, consultations_limit FROM subscriptions WHERE user_id = :user_id",
        values={"user_id": user_id},
    )
    if not sub:
        raise HTTPException(403, "No tenés suscripción activa")

    if sub["plan"] not in ("starter", "pro"):
        raise HTTPException(403, "Necesitás plan Starter o Pro para enviar consultas")

    if sub["consultations_used"] >= sub["consultations_limit"]:
        raise HTTPException(403, "Agotaste tus consultas disponibles este mes")

    consultation_id = str(uuid.uuid4())
    await database.execute("""
        INSERT INTO consultations (id, user_id, subject, message)
        VALUES (:id, :user_id, :subject, :message)
    """, values={
        "id": consultation_id,
        "user_id": user_id,
        "subject": body.subject,
        "message": body.message,
    })

    await database.execute("""
        UPDATE subscriptions
        SET consultations_used = consultations_used + 1, updated_at = NOW()
        WHERE user_id = :user_id
    """, values={"user_id": user_id})

    return {"id": consultation_id, "ok": True}


@router.get("")
async def get_consultations(claims: dict = Depends(verify_token)):
    firebase_uid = claims["uid"]

    user = await database.fetch_one(
        "SELECT id FROM users WHERE firebase_uid = :uid",
        values={"uid": firebase_uid},
    )
    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    user_id = str(user["id"])

    rows = await database.fetch_all("""
        SELECT id, subject, message, status, admin_response, created_at, answered_at
        FROM consultations
        WHERE user_id = :user_id
        ORDER BY created_at DESC
    """, values={"user_id": user_id})

    return [dict(r) for r in rows]
