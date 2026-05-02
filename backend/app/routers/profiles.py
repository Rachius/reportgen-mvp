from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.services.auth_service import verify_token, get_or_create_user
from app.services.profile_service import get_profile, update_profile

router = APIRouter()

async def get_current_user(token_data: dict = Depends(verify_token)):
    return await get_or_create_user(
        firebase_uid=token_data["uid"],
        email=token_data.get("email", "")
    )

@router.get("/profile")
async def read_profile(user=Depends(get_current_user)):
    profile = await get_profile(user["id"])
    return {"user": user, "profile": profile}

@router.put("/profile")
async def write_profile(data: dict, user=Depends(get_current_user)):
    profile = await update_profile(user["id"], data)
    return {"profile": profile}

@router.post("/profile/logo")
async def upload_company_logo(
    file: UploadFile = File(...),
    user: dict = Depends(verify_token),
):
    allowed_types = {"image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"}
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Formato no soportado. Usá PNG, JPG, WEBP o SVG.")

    contents = await file.read()
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(400, "El logo no puede superar 2 MB.")

    from app.services.file_service import upload_logo_to_gcs
    logo_url = await upload_logo_to_gcs(
        file_bytes=contents,
        filename=file.filename,
        user_id=str(user["uid"]),
        content_type=file.content_type,
    )

    from app.services.db_service import database
    await database.execute(
        """
        UPDATE company_profiles
        SET logo_url = :logo_url
        WHERE user_id = (SELECT id FROM users WHERE firebase_uid = :uid)
        """,
        values={"logo_url": logo_url, "uid": user["uid"]},
    )

    return {"logo_url": logo_url}


@router.delete("/profile/logo")
async def delete_company_logo(user: dict = Depends(verify_token)):
    from app.services.db_service import database
    from app.config import settings

    row = await database.fetch_one(
        """
        SELECT logo_url FROM company_profiles
        WHERE user_id = (SELECT id FROM users WHERE firebase_uid = :uid)
        """,
        values={"uid": user["uid"]},
    )

    if row and row["logo_url"]:
        try:
            from google.cloud import storage
            client = storage.Client()
            bucket = client.bucket(settings.GCS_BUCKET_NAME)
            blob_name = row["logo_url"].split(f"{settings.GCS_BUCKET_NAME}/")[-1]
            bucket.blob(blob_name).delete()
        except Exception:
            pass

    await database.execute(
        """
        UPDATE company_profiles
        SET logo_url = NULL
        WHERE user_id = (SELECT id FROM users WHERE firebase_uid = :uid)
        """,
        values={"uid": user["uid"]},
    )

    return {"message": "Logo eliminado"}
