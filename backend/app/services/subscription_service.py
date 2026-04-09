import mercadopago
import uuid
import hashlib
import hmac
from datetime import datetime, timezone
from app.services.db_service import database
from app.config import settings

sdk = mercadopago.SDK(settings.mp_access_token)

PLAN_CONFIG = {
    'free':    {'reports': 3,  'consultations': 0},
    'starter': {'reports': 10, 'consultations': 3},
    'pro':     {'reports': 30, 'consultations': 10},
}

STARTER_PRICE = 17500

async def get_or_create_subscription(user_id: str) -> dict:
    query = "SELECT * FROM subscriptions WHERE user_id = :user_id"
    sub = await database.fetch_one(query=query, values={"user_id": user_id})
    if not sub:
        sub_id = str(uuid.uuid4())
        insert = """
            INSERT INTO subscriptions (id, user_id, plan, reports_limit)
            VALUES (:id, :user_id, 'free', 3)
            RETURNING *
        """
        sub = await database.fetch_one(
            query=insert,
            values={"id": sub_id, "user_id": user_id}
        )
    return dict(sub)

async def can_generate_report(user_id: str) -> tuple[bool, str]:
    sub = await get_or_create_subscription(user_id)

    if not sub['approved']:
        return False, "Tu cuenta está pendiente de aprobación."

    if sub['status'] not in ('active', 'authorized'):
        return False, "Tu suscripción no está activa."

    if sub['reports_used'] >= sub['reports_limit']:
        if sub['plan'] == 'free':
            return False, "Agotaste tus 3 reportes gratuitos. Suscribite al plan Starter para continuar."
        period_end = sub['current_period_end']
        fecha = period_end.strftime('%d/%m/%Y') if period_end else 'próximo ciclo'
        return False, f"Alcanzaste el límite de reportes del mes ({sub['reports_limit']}). Se renueva el {fecha}."

    return True, "ok"

async def increment_report_usage(user_id: str):
    await database.execute(
        "UPDATE subscriptions SET reports_used = reports_used + 1, updated_at = NOW() WHERE user_id = :user_id",
        values={"user_id": user_id}
    )

async def create_checkout_url(user_id: str, user_email: str) -> str:
    preference_data = {
    "items": [{
        "title": "Reporti Starter — Suscripción mensual",
        "quantity": 1,
        "unit_price": STARTER_PRICE,
        "currency_id": "ARS",
    }],
    "payer": {"email": user_email},
    "back_urls": {
        "success": f"{settings.app_base_url}/subscription/success",
        "failure": f"{settings.app_base_url}/subscription/cancel",
        "pending": f"{settings.app_base_url}/subscription/pending",
    },
    "notification_url": f"https://particularly-unsquared-zaria.ngrok-free.dev/api/subscription/webhook",
    "metadata": {"user_id": str(user_id)},
    "statement_descriptor": "REPORTGEN",
}

    response = sdk.preference().create(preference_data)

    if response["status"] != 201:
        raise ValueError(f"MP error: {response}")

    preference = response["response"]

    if settings.environment == "development":
        return preference.get("sandbox_init_point") or preference.get("init_point")
    return preference.get("init_point")

async def activate_starter_plan(user_id: str, mp_payment_id: str = None):
    from datetime import timedelta
    period_end = datetime.now(timezone.utc) + timedelta(days=30)
    await database.execute("""
        UPDATE subscriptions SET
            plan = 'starter',
            reports_limit = 10,
            reports_used = 0,
            consultations_limit = 3,
            consultations_used = 0,
            current_period_end = :period_end,
            status = 'active',
            mp_subscription_id = :mp_id,
            updated_at = NOW()
        WHERE user_id = :user_id
    """, values={
        "period_end": period_end,
        "mp_id": mp_payment_id or "",
        "user_id": user_id
    })

async def handle_webhook(data: dict):
    topic = data.get("type") or data.get("topic", "")
    resource_id = None

    if topic == "payment":
        resource_id = data.get("data", {}).get("id") or data.get("id")
        if not resource_id:
            return

        payment_info = sdk.payment().get(resource_id)
        payment = payment_info["response"]
        status = payment.get("status")
        user_id = payment.get("metadata", {}).get("user_id")

        if not user_id:
            return

        if status == "approved":
            mp_payment_id = str(payment.get("id", ""))
            await activate_starter_plan(user_id, mp_payment_id)

        elif status in ("cancelled", "refunded", "charged_back"):
            await database.execute("""
                UPDATE subscriptions SET
                    plan = 'free',
                    reports_limit = 3,
                    reports_used = 0,
                    consultations_limit = 0,
                    status = 'canceled',
                    updated_at = NOW()
                WHERE user_id = :user_id
            """, values={"user_id": user_id})

DISPOSABLE_DOMAINS = {
    'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwam.com',
    'yopmail.com', 'sharklasers.com', 'maildrop.cc', 'trashmail.com',
    'dispostable.com', 'fakeinbox.com', 'spamgourmet.com', 'tempr.email',
}

async def calculate_risk_score(email: str, ip: str) -> int:
    score = 0
    domain = email.split('@')[-1].lower()
    if domain in DISPOSABLE_DOMAINS:
        score += 40
    if ip:
        result = await database.fetch_one(
            "SELECT COUNT(*) as cnt FROM users WHERE registration_ip = :ip",
            values={"ip": ip}
        )
        if result and result['cnt'] > 2:
            score += 30
    return min(score, 100)




def verify_mp_signature(payload: bytes, x_signature: str, x_request_id: str) -> bool:
    if not x_signature or not settings.mp_webhook_secret:
        return False

    parts = {}
    for part in x_signature.split(","):
        if "=" in part:
            k, v = part.strip().split("=", 1)
            parts[k] = v

    ts = parts.get("ts", "")
    received_hash = parts.get("v1", "")

    manifest = f"id:{x_request_id};request-id:{x_request_id};ts:{ts};"
    expected = hmac.new(
        settings.mp_webhook_secret.encode(),
        manifest.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected, received_hash)







async def create_user_subscription(user_id: str, email: str, ip: str = None):
    risk = await calculate_risk_score(email, ip or "")
    approved = risk < 60
    sub_id = str(uuid.uuid4())
    await database.execute("""
        INSERT INTO subscriptions (id, user_id, plan, reports_limit, risk_score, approved)
        VALUES (:id, :user_id, 'free', 3, :risk, :approved)
        ON CONFLICT (user_id) DO NOTHING
    """, values={"id": sub_id, "user_id": user_id, "risk": risk, "approved": approved})
    return approved