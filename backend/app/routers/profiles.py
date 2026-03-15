from fastapi import APIRouter, Depends
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