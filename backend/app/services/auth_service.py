import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header
from app.config import settings
from app.services.db_service import database
import uuid

if not firebase_admin._apps:
    cred = credentials.Certificate(settings.firebase_credentials_path)
    firebase_admin.initialize_app(cred)

async def verify_token(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Token inválido")
    token = authorization.replace("Bearer ", "")
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(401, "Token expirado o inválido")

async def get_or_create_user(firebase_uid: str, email: str) -> dict:
    query = "SELECT * FROM users WHERE firebase_uid = :uid"
    user = await database.fetch_one(query=query, values={"uid": firebase_uid})

    if not user:
        user_id = str(uuid.uuid4())
        insert_user = """
            INSERT INTO users (id, firebase_uid, email)
            VALUES (:id, :firebase_uid, :email)
            RETURNING *
        """
        user = await database.fetch_one(
            query=insert_user,
            values={"id": user_id, "firebase_uid": firebase_uid, "email": email}
        )
        insert_profile = """
            INSERT INTO company_profiles (id, user_id)
            VALUES (:id, :user_id)
        """
        await database.execute(
            query=insert_profile,
            values={"id": str(uuid.uuid4()), "user_id": user_id}
        )

    return dict(user)