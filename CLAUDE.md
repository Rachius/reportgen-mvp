# Reporti — Contexto del proyecto

## Qué es este proyecto
Reporti es una plataforma SaaS de generación automatizada de reportes de negocio. El usuario sube un CSV o Excel, selecciona el tipo de reporte y obtiene un PDF y/o PPTX profesional con análisis, KPIs, tendencias y recomendaciones generadas por Claude (Anthropic).

## Stack
- **Frontend:** React 18 + Vite + Tailwind CSS v3 — en `frontend/`
- **Backend:** Python 3.11 + FastAPI — en `backend/`
- **Base de datos:** Neon PostgreSQL serverless
- **Auth:** Firebase Auth (Email/Password + Google OAuth) + Firebase Admin SDK
- **IA:** Claude Sonnet 4.6 via Anthropic API
- **Pagos:** MercadoPago Checkout Pro (modo productivo)
- **Storage:** Google Cloud Storage (pendiente integración completa)
- **Deploy:** Cloud Run (backend) + Firebase Hosting (frontend)

## URLs de producción
- **Frontend:** https://report-i.com (también https://reportgen-mvp.web.app)
- **Backend:** https://api.report-i.com (Cloudflare Worker → Cloud Run southamerica-west1)
- **Cloud Run directo:** https://reporti-api-1022286938950.southamerica-west1.run.app

## Infraestructura
- **GCP proyecto:** reportgen-mvp
- **Artifact Registry:** southamerica-west1-docker.pkg.dev/reportgen-mvp/reporti-backend/api
- **Region Cloud Run:** southamerica-west1
- **Firebase proyecto:** reportgen-mvp
- **Neon:** región São Paulo
- **Cloudflare:** dominio report-i.com, Worker mappingreporti como proxy para api.report-i.com
- **Secret Manager GCP:** ANTHROPIC_API_KEY, DATABASE_URL, MP_ACCESS_TOKEN, MP_PUBLIC_KEY, MP_WEBHOOK_SECRET, GCP_PROJECT_ID, GCS_BUCKET_NAME, GCP_REGION, ENVIRONMENT, APP_BASE_URL, MAX_FILE_SIZE_MB, FIREBASE_CREDENTIALS (montado como archivo en /secrets/firebase/credentials.json)

## Comandos de deploy

### Backend (desde Cloud Shell):
```bash
cd ~/reportgen-mvp/backend
gcloud builds submit --tag southamerica-west1-docker.pkg.dev/reportgen-mvp/reporti-backend/api:latest

gcloud run deploy reporti-api \
  --image southamerica-west1-docker.pkg.dev/reportgen-mvp/reporti-backend/api:latest \
  --region southamerica-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  --set-secrets="ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,DATABASE_URL=DATABASE_URL:latest,MP_ACCESS_TOKEN=MP_ACCESS_TOKEN:latest,MP_PUBLIC_KEY=MP_PUBLIC_KEY:latest,MP_WEBHOOK_SECRET=MP_WEBHOOK_SECRET:latest,GCP_PROJECT_ID=GCP_PROJECT_ID:latest,GCS_BUCKET_NAME=GCS_BUCKET_NAME:latest,GCP_REGION=GCP_REGION:latest,ENVIRONMENT=ENVIRONMENT:latest,APP_BASE_URL=APP_BASE_URL:latest,MAX_FILE_SIZE_MB=MAX_FILE_SIZE_MB:latest" \
  --set-secrets="/secrets/firebase/credentials.json=FIREBASE_CREDENTIALS:latest"
```

### Frontend (desde máquina local):
```bash
cd frontend && npm run build && cd .. && firebase deploy --only hosting
```

## Estructura del repositorio
reportgen-mvp/

├── frontend/src/

│   ├── components/     FileDropzone, ReportConfig, DownloadPanel, Navbar, TabsNav

│   ├── context/        AuthContext, ThemeContext

│   ├── hooks/          useReportGenerator

│   ├── lib/            firebase.js, reportApi.js, fileValidator.js, adminApi.js

│   ├── styles/         variables.css (design system dual theme)

│   └── pages/          Home, Subscription, Consultations, Profile, About

│                       admin/(Dashboard/Users/Consultations/Reports)

├── backend/app/

│   ├── main.py         Entry point, CORS (localhost + report-i.com + reportgen-mvp.web.app)

│   ├── config.py       Settings pydantic-settings (firebase_credentials_path default /secrets/firebase/credentials.json)

│   ├── models/         schemas.py

│   ├── routers/        reports, profiles, auth, subscriptions, admin, consultations

│   ├── services/       claude, file, report, auth, profile, db, subscription, admin

│   ├── pdf_builders/   base_builder.py (WeasyPrint) + ventas_builder.py

│   └── templates/      base.html + ventas/report.html (Jinja2)

└── backend/Dockerfile  python:3.11-slim + WeasyPrint deps + gcc/build-essential

## Base de datos — tablas activas
- `users` — firebase_uid, email, registration_ip
- `company_profiles` — perfil empresa, column_mapping (JSONB), logo_url (pendiente GCS)
- `reports` — historial de reportes por usuario
- `subscriptions` — plan (free/starter/pro), reports_used, reports_limit, consultations_used, consultations_limit, mp_subscription_id, risk_score, approved
- `consultations` — subject, message, status, admin_response, answered_at, attachment_url (pendiente GCS)

## API endpoints principales
- `GET /health`
- `POST /api/auth/login`
- `GET/PUT /api/profile`
- `POST /api/profile/logo` (pendiente GCS)
- `POST /api/reports/generate`
- `GET /api/reports/status/{job_id}`
- `GET /api/reports/download/{job_id}/pdf|pptx`
- `GET/POST /api/subscription`
- `POST /api/subscription/checkout`
- `POST /api/subscription/webhook`
- `GET/POST /api/consultations`
- `GET /api/admin/metrics`
- `GET/PUT /api/admin/users`
- `GET/PUT /api/admin/consultations`
- `GET /api/admin/reports`

## Planes de suscripción
- **Free:** 3 reportes totales, solo PDF, sin perfil de empresa
- **Starter:** $20.000 ARS/mes, 10 reportes/mes, PDF + PPTX, perfil empresa, 3 consultas/mes
- **Pro (futuro):** $35 USD/mes, 30 reportes/mes, 10 consultas

## Design system
- **Colores:** #4EC7F5 (celeste) + #FE7808 (naranja)
- **Degradado:** linear-gradient(135deg, #4EC7F5, #FE7808)
- **Modo claro:** bg #F8FAFB, cards #FFFFFF, texto #0F1923
- **Modo oscuro:** bg #0F172A, cards #111827, gradientes azul→violeta (#3B82F6→#8B5CF6)
- **Border radius:** cards 10px, botones 4px
- **Tema:** clase .dark en html, guardado en localStorage key "reporti-theme"
- **Navbar:** logo + switch tema + email + botón "?" + Salir
- **Navegación:** TabsNav debajo del navbar (Inicio | Mi plan | Consultas | Perfil | Admin)

## Pendiente (backlog)
- Fix webhook MercadoPago (verify_mp_signature no definida + JSONDecodeError)
- Botón cambio manual de plan en panel admin
- Logo de empresa — upload a GCS (credenciales automáticas en Cloud Run)
- Adjuntar archivos en consultas — upload a GCS (ídem)
- Emails transaccionales (Resend)
- Terms of Service + Privacy Policy
- Dark mode fixes (sección inferior dashboard)
- WeasyPrint en producción (ya instalado en Dockerfile)

## Convenciones técnicas
- DAX variables: nunca usar `Value` — usar `_KPI`, `_Valor`, `_Res`
- UUID siempre convertir a `str()` antes de queries o librerías externas
- GCS en local: usar `storage.Client.from_service_account_json(settings.firebase_credentials_path)` — en Cloud Run usar `storage.Client()` directamente
- PDF: WeasyPrint (no xhtml2pdf) — import weasyprint, weasyprint.HTML(string=html).write_pdf()
- get_builder(report_type) retorna una CLASE, instanciar con BuilderClass(analysis, profile)
- Increment de reportes_used solo después de generación exitosa, no antes
- El sidebar del admin es siempre oscuro independientemente del tema global