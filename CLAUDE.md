# Reporti — Contexto del proyecto

## Qué es este proyecto
Reporti es una plataforma SaaS de generación automatizada de reportes de negocio. El usuario sube un CSV o Excel, selecciona el tipo de reporte y obtiene un PDF y/o PPTX profesional con análisis, KPIs, tendencias y recomendaciones generadas por Claude (Anthropic).

## Stack
- **Frontend:** React 18 + Vite + Tailwind CSS v3 — en `frontend/`
- **Backend:** Python 3.11 + FastAPI — en `backend/`
- **Base de datos:** Neon PostgreSQL serverless
- **Auth:** Firebase Auth (Email/Password + Google OAuth) + Firebase Admin SDK en backend
- **IA:** Claude Sonnet 4.6 via Anthropic API
- **Pagos:** MercadoPago Checkout Pro
- **Deploy (pendiente):** Cloud Run (backend) + Firebase Hosting (frontend)

## Estructura del repositorio

reportgen-mvp/
├── frontend/src/
│   ├── components/     FileDropzone, ReportConfig, DownloadPanel, Navbar
│   ├── context/        AuthContext (estado global auth + métodos Firebase)
│   ├── hooks/          useReportierator (polling + estado)
│   ├── lib/            firebase.js, reportApi.js, fileValidator.js
│   └── pages/          Home, Login, Profile, Subscription
├── backend/app/
│   ├── main.py         Entry point, CORS, startup DB
│   ├── config.py       Settings con pydantic-settings desde .env
│   ├── models/         schemas.py (Pydantic)
│   ├── routers/        reports, profiles, auth, subscriptions
│   ├── services/       claude, file, report, auth, profile, db, subscription
│   ├── pdf_builders/   base_builder.py + ventas_builder.py (patrón escalable)
│   └── templates/      base.html + ventas/report.html (Jinja2)


## Base de datos — tablas activas
- `users` — firebase_uid, email, registration_ip
- `company_profiles` — perfil de empresa, column_mapping (JSONB), contexto para Claude
- `reports` — historial de reportes por usuario
- `subscriptions` — plan (free/starter/pro), reports_used, reports_limit, mp_subscription_id, risk_score, approved

## API endpoints
- `GET /health`
- `POST /api/auth/login` — upsert usuario en Neon con token Firebase
- `GET/PUT /api/profile` — perfil de empresa
- `POST /api/reports/generate` — recibe archivo, lanza BackgroundTask, devuelve job_id
- `GET /api/reports/status/{job_id}` — polling del estado
- `GET /api/reports/download/{job_id}/pdf|pptx` — descarga directa
- `GET /api/subscription` — estado del plan del usuario
- `POST /api/subscription/checkout` — genera URL de MercadoPago
- `POST /api/subscription/webhook` — recibe notificaciones de MP

## Planes de suscripción
- **Free:** 3 reportes totales (no mensuales), solo PDF, sin perfil de empresa
- **Starter:** $17.500 ARS/mes, 10 reportes/mes, PDF + PPTX, perfil de empresa, 3 consultas al analista
- **Pro (futuro):** $35 USD/mes, 30 reportes/mes, 10 consultas

## Flujo de generación de reporte
1. Frontend valida archivo (tipo + tamaño) con fileValidator.js
2. POST /api/reports/generate → devuelve job_id inmediatamente
3. BackgroundTask: parse Pandas → análisis Claude → PDF/PPTX
4. Frontend hace polling cada 2s a /status/{job_id}
5. Cuando status=done, muestra botones de descarga

## Convenciones importantes
- Los UUIDs siempre se convierten a `str()` antes de pasar a librerías externas
- Las variables DAX nunca se llaman `Value` — usar `_KPI`, `_Valor`, `_Res`
- El entorno virtual del backend siempre debe estar activo: `venv\Scripts\activate`
- Backend corre en `localhost:8000`, frontend en `localhost:5173`
- El archivo `firebase-credentials.json` y `.env` nunca se suben al repo
- Para PDF en local se usa xhtml2pdf — en producción (Cloud Run/Linux) se migrará a WeasyPrint
- Los templates PDF usan Jinja2 con herencia — `base.html` define estilos, cada tipo extiende con su bloque `content`

## Sprint actual: Panel de admin (Sprint 5)
Objetivo: construir un panel de administración interno para:
- Ver y gestionar usuarios registrados
- Aprobar cuentas con risk_score alto
- Ver y responder consultas de usuarios (plan Starter)
- Monitor de reportes generados y uso de la plataforma

## Variables de entorno necesarias
### backend/.env
- ANTHROPIC_API_KEY
- GCP_PROJECT_ID, GCS_BUCKET_NAME, GCP_REGION
- DATABASE_URL (Neon connection string)
- FIREBASE_CREDENTIALS_PATH
- MP_ACCESS_TOKEN, MP_PUBLIC_KEY, MP_WEBHOOK_SECRET
- APP_BASE_URL, ENVIRONMENT, MAX_FILE_SIZE_MB

### frontend/.env
- VITE_API_URL
- VITE_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID

## Comandos para levantar en local
```bash
# Terminal 1 — Backend
cd backend && venv\Scripts\activate && uvicorn app.main:app

# Terminal 2 — Frontend  
cd frontend && npm run dev

# Terminal 3 — Ngrok (para webhooks de MP)
ngrok http 8000
```

## Lo que NO está implementado todavía
- Panel de admin (en desarrollo)
- Historial de reportes en frontend
- Preview del reporte antes de descargar
- Deploy (Docker + Cloud Run + Firebase Hosting)
- WeasyPrint en producción
- Cupones de descuento
- Plan Pro
- Recupero automático de suscripción ante pago fallido
