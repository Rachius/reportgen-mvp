from fastapi import APIRouter, Depends
from app.services.auth_service import verify_token, get_or_create_user

router = APIRouter()

@router.post("/auth/login")
async def login(token_data: dict = Depends(verify_token)):
    user = await get_or_create_user(
        firebase_uid=token_data["uid"],
        email=token_data.get("email", "")
    )
    return {"user_id": user["id"], "email": user["email"]}