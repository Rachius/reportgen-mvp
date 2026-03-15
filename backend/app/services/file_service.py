import pandas as pd
from fastapi import UploadFile, HTTPException
import io
import numpy as np

ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.xls'}
MAX_SIZE_MB = 10

def make_serializable(obj):
    if isinstance(obj, dict):
        return {k: make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_serializable(i) for i in obj]
    elif isinstance(obj, float) and np.isnan(obj):
        return None
    elif hasattr(obj, 'isoformat'):
        return obj.isoformat()
    elif isinstance(obj, (np.integer,)):
        return int(obj)
    elif isinstance(obj, (np.floating,)):
        return float(obj)
    elif isinstance(obj, (np.bool_,)):
        return bool(obj)
    return obj

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

    # Convertir fechas a string para serialización
    for col in df.select_dtypes(include=['datetime64[ns]', 'datetime64[ns, UTC]']).columns:
        df[col] = df[col].dt.strftime('%Y-%m-%d')

    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "preview": make_serializable(df.head(20).to_dict(orient='records')),
        "stats": make_serializable(df.describe(include='all').fillna('').to_dict()),
        "sums": make_serializable(df.select_dtypes(include='number').sum().to_dict()),
    }