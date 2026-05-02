import anthropic
import json
from app.config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

def build_company_context(profile: dict) -> str:
    if not profile:
        return ""
    parts = []
    if profile.get("company_name"):
        parts.append(f"Empresa: {profile['company_name']}")
    if profile.get("industry"):
        parts.append(f"Industria: {profile['industry']}")
    if profile.get("country"):
        parts.append(f"País: {profile['country']}")
    if profile.get("currency"):
        parts.append(f"Moneda: {profile['currency']}")
    if profile.get("business_description"):
        parts.append(f"Descripción del negocio: {profile['business_description']}")
    if profile.get("extra_context"):
        parts.append(f"Contexto adicional: {profile['extra_context']}")
    col_map = profile.get("column_mapping")
    if col_map:
        if isinstance(col_map, str):
            col_map = json.loads(col_map)
        if col_map:
            parts.append(f"Mapeo de columnas clave: {json.dumps(col_map, ensure_ascii=False)}")
    return "\n".join(parts)

SALES_PROMPT = """Sos un analista de datos senior especializado en reportes comerciales.
Analizá los siguientes datos de ventas y generá un reporte ejecutivo profesional en español.

{company_context}

DATOS DEL ARCHIVO:
- Nombre: {filename}
- Filas: {rows}
- Columnas: {columns}
- Preview (primeras 20 filas): {preview}
- Estadísticas descriptivas: {stats}
- Sumas totales por columna numérica: {sums}

REGLAS IMPORTANTES:
- Usá SIEMPRE los valores de "sumas totales" para reportar totales — nunca estimes multiplicando media por cantidad.
- Si existe una columna de estado, calculá la facturación solo sobre registros con estado activo/facturado.
- Si el perfil de empresa indica la moneda, usala en todos los valores monetarios.
- Si el perfil indica el mapeo de columnas, usá esos nombres para identificar monto, fecha, vendedor y estado.
- No inventes ni estimes valores que se pueden calcular desde los datos.

Generá un análisis con EXACTAMENTE esta estructura JSON (sin texto adicional, solo el JSON):
{{
  "titulo": "título del reporte basado en los datos y el nombre de la empresa si está disponible",
  "resumen_ejecutivo": "párrafo de 3-4 oraciones con los hallazgos principales",
  "kpis": [
    {{"nombre": "nombre del KPI", "valor": "valor formateado", "descripcion": "qué representa"}}
  ],
  "tendencias": [
    {{"titulo": "título", "descripcion": "descripción de 2-3 oraciones"}}
  ],
  "top_items": [
    {{"categoria": "nombre", "valor": "valor", "participacion": "% del total"}}
  ],
  "recomendaciones": [
    {{"titulo": "título corto", "descripcion": "acción concreta recomendada"}}
  ],
  "conclusion": "párrafo de cierre con próximos pasos sugeridos"
}}

Incluí mínimo 3 KPIs, 2 tendencias, 3 top items y 3 recomendaciones.
Basate SOLO en los datos provistos."""

async def analyze_sales_data(file_data: dict) -> dict:
    profile = file_data.get('company_profile', {})
    company_context = build_company_context(profile)
    context_block = f"CONTEXTO DE LA EMPRESA:\n{company_context}\n" if company_context else ""

    import pandas as pd, io
    sums = file_data.get('sums', {})

    prompt = SALES_PROMPT.format(
        company_context=context_block,
        filename=file_data['filename'],
        rows=file_data['rows'],
        columns=file_data['columns'],
        preview=json.dumps(file_data['preview'], ensure_ascii=False),
        stats=json.dumps(file_data['stats'], ensure_ascii=False),
        sums=json.dumps(sums, ensure_ascii=False),
    )

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()
    raw = raw.replace('```json', '').replace('```', '').strip()

    start = raw.find('{')
    end = raw.rfind('}')
    if start == -1 or end == -1:
        raise ValueError("Claude no devolvió un JSON válido")
    raw = raw[start:end+1]

    import re
    raw = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', raw)
    raw = re.sub(r'(?<!\\)\n', ' ', raw)
    raw = re.sub(r'(?<!\\)\r', ' ', raw)
    raw = raw.replace('—', '-').replace('–', '-').replace('"', '"').replace('"', '"').replace("'", "'").replace("'", "'")

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Error parseando respuesta de Claude: {str(e)}\nRaw: {raw[:500]}")