from app.services.db_service import database
from datetime import date, timedelta


async def get_metrics() -> dict:
    total_users = await database.fetch_one("SELECT COUNT(*) as cnt FROM users")
    active_subscribers = await database.fetch_one("""
        SELECT COUNT(*) as cnt FROM subscriptions
        WHERE plan != 'free' AND status = 'active'
    """)
    reports_today = await database.fetch_one("""
        SELECT COUNT(*) as cnt FROM reports
        WHERE DATE(created_at AT TIME ZONE 'UTC') = CURRENT_DATE
    """)
    pending_consultations = await database.fetch_one("""
        SELECT COUNT(*) as cnt FROM consultations WHERE status = 'pending'
    """)

    rows_7d = await database.fetch_all("""
        SELECT DATE(created_at AT TIME ZONE 'UTC') as day, COUNT(*) as cnt
        FROM reports
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY day
        ORDER BY day
    """)
    reports_last_7_days = [{"date": str(r["day"]), "count": r["cnt"]} for r in rows_7d]

    plan_rows = await database.fetch_all("""
        SELECT plan, COUNT(*) as cnt FROM subscriptions GROUP BY plan
    """)
    plan_distribution = {"free": 0, "starter": 0, "pro": 0}
    for r in plan_rows:
        if r["plan"] in plan_distribution:
            plan_distribution[r["plan"]] = r["cnt"]

    return {
        "total_users": total_users["cnt"],
        "active_subscribers": active_subscribers["cnt"],
        "reports_today": reports_today["cnt"],
        "pending_consultations": pending_consultations["cnt"],
        "reports_last_7_days": reports_last_7_days,
        "plan_distribution": plan_distribution,
    }


async def get_users(page: int = 1, limit: int = 20) -> list:
    offset = (page - 1) * limit
    rows = await database.fetch_all("""
        SELECT
            u.id, u.email, u.firebase_uid,
            s.plan, s.reports_used, s.reports_limit,
            s.risk_score, s.approved, s.status,
            u.created_at
        FROM users u
        LEFT JOIN subscriptions s ON s.user_id = u.id
        ORDER BY u.created_at DESC
        LIMIT :limit OFFSET :offset
    """, values={"limit": limit, "offset": offset})
    return [dict(r) for r in rows]


async def approve_user(user_id: str):
    await database.execute("""
        UPDATE subscriptions SET approved = TRUE, updated_at = NOW()
        WHERE user_id = :user_id
    """, values={"user_id": user_id})


async def block_user(user_id: str):
    await database.execute("""
        UPDATE subscriptions SET approved = FALSE, status = 'canceled', updated_at = NOW()
        WHERE user_id = :user_id
    """, values={"user_id": user_id})


async def get_consultations(status: str = None) -> list:
    if status:
        rows = await database.fetch_all("""
            SELECT c.id, u.email as user_email, c.subject, c.message,
                   c.status, c.admin_response, c.created_at, c.answered_at
            FROM consultations c
            JOIN users u ON u.id = c.user_id
            WHERE c.status = :status
            ORDER BY c.created_at DESC
        """, values={"status": status})
    else:
        rows = await database.fetch_all("""
            SELECT c.id, u.email as user_email, c.subject, c.message,
                   c.status, c.admin_response, c.created_at, c.answered_at
            FROM consultations c
            JOIN users u ON u.id = c.user_id
            ORDER BY c.created_at DESC
        """)
    return [dict(r) for r in rows]


async def answer_consultation(consultation_id: str, response: str):
    await database.execute("""
        UPDATE consultations
        SET admin_response = :response, status = 'answered', answered_at = NOW()
        WHERE id = :id
    """, values={"response": response, "id": consultation_id})


async def get_recent_reports(limit: int = 50) -> list:
    rows = await database.fetch_all("""
        SELECT r.id, u.email as user_email, r.filename, r.report_type,
               r.formats, r.status, r.created_at
        FROM reports r
        JOIN users u ON u.id = r.user_id
        ORDER BY r.created_at DESC
        LIMIT :limit
    """, values={"limit": limit})
    return [dict(r) for r in rows]
