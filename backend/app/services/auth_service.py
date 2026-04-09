import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Header, Depends
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

async def verify_admin(token_data: dict = Depends(verify_token)) -> dict:
    if not token_data.get("admin"):
        raise HTTPException(403, "Acceso restringido a administradores")
    return token_data


async def get_or_create_user(firebase_uid: str, email: str) -> dict:
    # Primero buscar por firebase_uid
    query = "SELECT * FROM users WHERE firebase_uid = :uid"
    user = await database.fetch_one(query=query, values={"uid": firebase_uid})

    if not user:
        # Buscar por email para evitar duplicados con Google OAuth
        query_email = "SELECT * FROM users WHERE email = :email"
        user = await database.fetch_one(query=query_email, values={"email": email})

        if user:
            # Actualizar el firebase_uid al nuevo proveedor
            await database.execute(
                "UPDATE users SET firebase_uid = :uid, updated_at = NOW() WHERE email = :email",
                values={"uid": firebase_uid, "email": email}
            )
            user = await database.fetch_one(query=query, values={"uid": firebase_uid})
        else:
            # Crear usuario nuevo
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