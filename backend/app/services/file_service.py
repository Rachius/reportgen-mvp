import pandas as pd
from fastapi import UploadFile, HTTPException
import io

ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.xls'}
MAX_SIZE_MB = 10

async def parse_file(file: UploadFile) -> dict:
    ext = '.' + file.filename.split('.')[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Formato no soportado: {ext}")

    content = await file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"Archivo supera {MAX_SIZE_MB} MB")

    try:
        if ext == '.csv':
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"No se pudo leer el archivo: {str(e)}")

    if df.empty:
        raise HTTPException(400, "El archivo está vacío")

    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "preview": df.head(20).to_dict(orient='records'),
        "stats": df.describe(include='all').fillna('').to_dict(),
    }