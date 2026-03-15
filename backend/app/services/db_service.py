import databases
from app.config import settings

database = databases.Database(settings.database_url)

async def connect():
    await database.connect()

async def disconnect():
    await database.disconnect()