from fastapi import APIRouter, Depends, Request
from app.services.auth_service import verify_token, get_or_create_user
from app.services.subscription_service import (
    get_or_create_subscription,
    create_checkout_url,
    handle_webhook,
)
from app.config import settings

router = APIRouter()

async def get_current_user(token_data: dict = Depends(verify_token)):
    return await get_or_create_user(
        firebase_uid=token_data["uid"],
        email=token_data.get("email", "")
    )

@router.get("/subscription")
async def read_subscription(user=Depends(get_current_user)):
    sub = await get_or_create_subscription(user["id"])
    return {
        "plan": sub["plan"],
        "status": sub["status"],
        "reports_used": sub["reports_used"],
        "reports_limit": sub["reports_limit"],
        "consultations_used": sub["consultations_used"],
        "consultations_limit": sub["consultations_limit"],
        "current_period_end": sub["current_period_end"],
        "approved": sub["approved"],
        "mp_public_key": settings.mp_public_key,
    }

@router.post("/subscription/checkout")
async def checkout(user=Depends(get_current_user)):
    url = await create_checkout_url(user["id"], user["email"])
    return {"url": url}

@router.post("/subscription/webhook")
async def webhook(request: Request):
    payload = await request.body()
    data = await request.json()

    # Validar que viene de MP en producción
    if settings.environment != "development":
        x_signature = request.headers.get("x-signature", "")
        x_request_id = request.headers.get("x-request-id", "")
        if not verify_mp_signature(payload, x_signature, x_request_id):
            from fastapi import HTTPException
            raise HTTPException(400, "Firma inválida")

    await handle_webhook(data)
    return {"received": True}