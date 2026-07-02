from fastapi import APIRouter, Depends, Request
from app.services.auth_service import verify_token, get_or_create_user
from app.services.subscription_service import (
    get_or_create_subscription,
    create_checkout_url,
)
from app.config import settings
import json

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
    try:
        body = await request.body()
        data = json.loads(body) if body else {}
    except Exception:
        data = {}

    params = dict(request.query_params)

    # MP envía "data.id" como key literal en query params
    resource_id = (
        data.get("data", {}).get("id") or
        data.get("id") or
        params.get("data.id") or
        params.get("id", "")
    )

    # MP envía type como "topic_merchant_order_wh" o "payment"
    raw_type = (
        data.get("type") or
        data.get("topic") or
        params.get("type") or
        params.get("topic", "")
    )

    is_merchant_order = "merchant_order" in raw_type
    is_payment = "payment" in raw_type and "merchant_order" not in raw_type

    if not resource_id:
        return {"status": "ignored", "reason": "no_resource_id"}

    try:
        import mercadopago
        sdk = mercadopago.SDK(settings.mp_access_token)

        if is_merchant_order:
            order = sdk.merchant_order().get(resource_id)
            order_data = order.get("response", {})
            payments = order_data.get("payments", [])
            paid_amount = sum(
                p["total_paid_amount"]
                for p in payments
                if p["status"] == "approved"
            )
            order_amount = order_data.get("total_amount", 0)
            if paid_amount >= order_amount and order_amount > 0:
                payer_email = order_data.get("payer", {}).get("email", "")
                if payer_email:
                    from app.services.db_service import database
                    user = await database.fetch_one(
                        "SELECT id FROM users WHERE email = :email",
                        values={"email": payer_email}
                    )
                    if user:
                        from app.services.subscription_service import activate_starter_plan
                        await activate_starter_plan(str(user["id"]), str(resource_id))
                        return {"status": "activated", "via": "merchant_order"}

        elif is_payment:
            payment = sdk.payment().get(resource_id)
            payment_data = payment.get("response", {})
            if payment_data.get("status") == "approved":
                payer_email = payment_data.get("payer", {}).get("email", "")
                if payer_email:
                    from app.services.db_service import database
                    user = await database.fetch_one(
                        "SELECT id FROM users WHERE email = :email",
                        values={"email": payer_email}
                    )
                    if user:
                        from app.services.subscription_service import activate_starter_plan
                        await activate_starter_plan(str(user["id"]), str(resource_id))
                        return {"status": "activated", "via": "payment"}

        return {"status": "processed_no_action", "type": raw_type, "id": resource_id}

    except Exception as e:
        print(f"Webhook error: {e}")
        return {"status": "error", "detail": str(e)}