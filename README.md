# SinergyOS v0.1

Plataforma SaaS multi-tenant de agentes IA empresariales.
Construida sobre MolloIA — FastAPI + Next.js 15 + Qdrant + PostgreSQL.

## Estructura

```
sinergy_os/
├── core/brain/         → FastAPI + Skills engine (heredado de MolloIA)
├── frontend/           → Next.js 15 (dashboard comercial — pendiente)
├── skills/             → SKILL.md por vertical de negocio
│   ├── SKILL_ROUTER.md         → Clasificador sin LLM
│   ├── SKILL_CONTEXT_CACHE.md  → Cache contexto estático TTL 5min
│   ├── SKILL_MEMORY_TRIM.md    → Memoria compacta vía Qdrant
│   └── SKILL_STREAM_FIX.md     → Streaming real en modo agente
├── billing/            → Sistema de planes y límites (pendiente)
└── infra/              → Docker compose, nginx config (pendiente)
```

## Tenant base

| slug | plan | req_limit |
|---|---|---|
| adolfo | enterprise | ilimitado |

DB: `molloai_postgres:5434` tabla `sinergy_tenants`

## Stack

- Backend: FastAPI + Python 3.12 + uvicorn
- Frontend: Next.js 15 + React 19 + TypeScript + Tailwind
- Vector: Qdrant 6333
- DB: PostgreSQL 5434
- Models: GPT-4o-mini (simple) → GPT-4o (medio) → Claude Sonnet 4.6 (complejo)

## Planes

| Plan | Precio | Requests/mes | Skills |
|---|---|---|---|
| Basic | $19/mes | 500 | 3 predefinidas |
| Pro | $79/mes | 5,000 | Personalizadas + API |
| Enterprise | $299/mes | 50,000 | White-label + SLA |

## Próximos pasos

1. [ ] Aplicar SKILL_ROUTER en mollo_brain (eliminar classify_complexity LLM call)
2. [ ] Aplicar SKILL_CONTEXT_CACHE (cache 5min contexto estático)
3. [ ] Migrar mollo_memory.json → Qdrant (SKILL_MEMORY_TRIM)
4. [ ] Middleware multi-tenant en core/brain (leer tenant de API key)
5. [ ] Frontend dashboard comercial (Next.js)
6. [ ] Sistema de billing (Stripe o manual)
