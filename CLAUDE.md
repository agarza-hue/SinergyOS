# SinergyOS — Instrucciones para Claude Code

## Qué es este proyecto
SinergyOS es una plataforma SaaS multi-tenant que expone agentes IA (RAG + memoria semántica)
a empresas vía API REST. El cliente se registra, paga con Stripe, recibe su API key por email,
sube sus documentos y hace consultas con `X-API-Key`.

## Arquitectura
- **Brain** (`/root/mollo_brain/`) — FastAPI en puerto 8002, venv en `/root/venv/`, systemd: `mollo-brain`
- **Frontend** (`/root/sinergy_os/frontend/`) — Next.js 15, basePath `/sinergy`, PM2: `sinergy-web` puerto 3003
- **DB** — PostgreSQL en Docker `molloai_postgres` puerto 5434, DB `molloai`, user `molloai_user`
- **Vectores** — Qdrant en puerto 6333, colección `sinergy_<slug>` por tenant
- **Proxy** — nginx en Docker `juntas_nginx`, ruta `/sinergy/` → `172.20.0.1:3003`

## Comandos críticos
```bash
systemctl restart mollo-brain          # reiniciar brain
pm2 restart sinergy-web                # reiniciar frontend
cd /root/sinergy_os/frontend && npm run build  # compilar antes de pm2 restart
tail -f /var/log/mollo_brain.log       # logs del brain
docker exec molloai_postgres psql -U molloai_user -d molloai  # acceso DB
```

## Convenciones de código
- Python: snake_case, SQLAlchemy con `text()`, routers en `/root/mollo_brain/routers/`
- TypeScript: componentes en `app/`, rutas API en `app/api/`, sin `export default` en routes
- Commits: siempre con `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
- Nunca commitear `.env`, `node_modules`, `__pycache__`, `.next`

## Reglas importantes
- Al cambiar el brain: `systemctl restart mollo-brain` + verificar con `systemctl is-active`
- Al cambiar el frontend: `npm run build` primero, luego `pm2 restart sinergy-web`
- Tenant admin `adolfo` y `sinergy-local`: nunca eliminar, nunca revocar admin
- No mockear DB en tests — usar la real
- Respuestas en español salvo que el usuario escriba en inglés

## Estado actual → ver KNOWLEDGE.md
