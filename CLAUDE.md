# ReportGen — Contexto del proyecto

## Qué es este proyecto
ReportGen es una plataforma SaaS de generación automatizada de reportes de negocio. El usuario sube un CSV o Excel, selecciona el tipo de reporte y obtiene un PDF y/o PPTX profesional con análisis, KPIs, tendencias y recomendaciones generadas por Claude (Anthropic).

## Stack
- **Frontend:** React 18 + Vite + Tailwind CSS v3 — en `frontend/`
- **Backend:** Python 3.11 + FastAPI — en `backend/`
- **Base de datos:** Neon PostgreSQL serverless
- **Auth:** Firebase Auth (Email/Password + Google OAuth) + Firebase Admin SDK en backend
- **IA:** Claude Sonnet 4.6 via Anthropic API
- **Pagos:** MercadoPago Checkout Pro
- **Deploy (pendiente):** Cloud Run (backend) + Firebase Hosting (frontend)

## Estructura del repositorio