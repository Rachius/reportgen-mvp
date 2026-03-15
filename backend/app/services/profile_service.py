from app.services.db_service import database

async def get_profile(user_id: str) -> dict:
    query = "SELECT * FROM company_profiles WHERE user_id = :user_id"
    profile = await database.fetch_one(query=query, values={"user_id": user_id})
    return dict(profile) if profile else {}

async def update_profile(user_id: str, data: dict) -> dict:
    query = """
        UPDATE company_profiles SET
            company_name = :company_name,
            industry = :industry,
            country = :country,
            currency = :currency,
            business_description = :business_description,
            column_mapping = :column_mapping,
            extra_context = :extra_context,
            onboarding_completed = :onboarding_completed,
            updated_at = NOW()
        WHERE user_id = :user_id
        RETURNING *
    """
    import json
    values = {
        "user_id": user_id,
        "company_name": data.get("company_name"),
        "industry": data.get("industry"),
        "country": data.get("country", "Argentina"),
        "currency": data.get("currency", "ARS"),
        "business_description": data.get("business_description"),
        "column_mapping": json.dumps(data.get("column_mapping", {})),
        "extra_context": data.get("extra_context"),
        "onboarding_completed": data.get("onboarding_completed", False),
    }
    profile = await database.fetch_one(query=query, values=values)
    return dict(profile) if profile else {}