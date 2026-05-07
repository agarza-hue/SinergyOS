# SinergyOS — Knowledge Base
_Actualizado automáticamente con /update-kb. No editar manualmente._

## Estado general
- **Fase**: Listo para producción (pendiente HTTPS + dominio + Resend API key)
- **Tenants activos**: ~10 en DB (incluyendo adolfo, sinergy-local, garzacorp)
- **Último deploy**: brain `main` + frontend `master` en sync

## Módulos implementados

### InsForge (multi-tenant middleware)
- `X-API-Key` header → valida contra `sinergy_tenants`
- Rate limiting por plan (Basic 500, Pro 5000, Enterprise ilimitado)
- Admin bypass total (`is_admin=TRUE`)
- Status: `active` / `pending` / `suspended` → 402 si no activo
- Archivo: `/root/mollo_brain/insforge.py`

### Registro público
- `POST /sinergy/register` → crea tenant `pending` + retorna `checkout_url` Stripe
- Enterprise → `active` directo con API key visible
- Frontend: `/sinergy/register` (plan selector + form)
- Archivo: `/root/mollo_brain/routers/tenants.py`

### Stripe Billing
- Productos: Basic `price_1TUNE4DM3KbBor3xJiEFRgCR` ($49/mo), Pro `price_1TUNE5DM3KbBor3xV3YpcNxQ` ($199/mo)
- Webhook registrado: `we_1TUNGJDM3KbBor3xYDG9ex7r` → `http://79.143.94.153/sinergy/api/billing/webhook`
- `checkout.session.completed` → activa tenant + envía API key por email
- `subscription.deleted/paused` → suspende tenant
- Modo: **TEST** (sk_test_... / pk_test_...)
- Archivo: `/root/mollo_brain/routers/billing.py`

### Contexto aislado por tenant
- Cada tenant tiene colección Qdrant `sinergy_<slug>`
- Uploads y búsquedas scoped al tenant autenticado
- Sin key → usa colección interna `mollo_empresa`
- Archivos: `qdrant_service.py`, `routers/documents.py`, `routers/chat.py`

### Alertas de uso
- 80% → email alerta (una vez por ciclo, flag `alert_sent_80`)
- 100% → email límite alcanzado
- Servicio: `/root/mollo_brain/alert_service.py` (Resend HTTP API)
- **Pendiente**: agregar `RESEND_API_KEY` al `.env` del brain
- Reset mensual: cron `5 0 1 * *` → `POST /sinergy/admin/reset-monthly`

### Dashboard admin
- URL: `/sinergy/dashboard` (requiere password en cookie `sinergy_session`)
- Tabs: Overview · Costs · Queries · Topics · Tenants
- Tab Tenants: lista completa, crear, rotar key, toggle admin, reset uso, eliminar
- Columna de costo por tenant (desde `cost_log`)

### API Docs
- URL: `/sinergy/docs` (pública)
- Endpoints documentados: `/chat/ask`, `/chat/stream`, `/docs/upload`, `/docs/list`
- Tabs de código: curl / Python / Node.js

## Pendientes para producción
1. **HTTPS + dominio** — nginx TLS, apuntar DNS, actualizar `SINERGY_BASE_URL`
2. **RESEND_API_KEY** — activar emails de API key y alertas
3. **Stripe live mode** — cambiar a `sk_live_...` + nuevo webhook HTTPS
4. **Customer Portal** — endpoint para que el tenant gestione su suscripción
5. **Status en tab Tenants** — mostrar active/pending/suspended en el dashboard

## Decisiones técnicas relevantes
- Stripe SDK v15: `construct_event` devuelve `StripeObject`, hay que re-parsear el raw JSON
- Next.js `basePath=/sinergy`: middleware ve rutas SIN el prefijo → matcher `['/dashboard/:path*']`
- Background tasks FastAPI: `increment_usage` debe ir ANTES de `_save_in_background`
- SMTP bloqueado en VPS → usar Resend HTTP API (puerto 443)
- `alert_sent_80` se resetea junto con `req_used` en el reset mensual
