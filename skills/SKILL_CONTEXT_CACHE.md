# SKILL: Context Cache — Contexto Estático con TTL

**Reemplaza:** carga en cada request de `business_context`, `learnings_context`, `topic_memory`  
**Ahorro estimado:** ~1,600 tokens × precio_modelo por request (contexto ya en caché de Anthropic)

## Problema

Cada request en `routers/chat.py` llama:
```python
memory_context, business_ctx, learnings_ctx, topic_memory = _collect_context(query_vector, req)
```

`business_ctx` y `learnings_ctx` cambian rara vez (1-2x/día).
`topic_memory` cambia cada N conversaciones.
Se recalculan y re-envían en CADA request — tokens innecesarios.

## Solución: cache en memoria con TTL

```python
import time
from functools import lru_cache

_STATIC_CACHE: dict = {}
_CACHE_TTL = 300  # 5 minutos

def get_static_context() -> tuple[str, str, str]:
    now = time.time()
    if "ts" not in _STATIC_CACHE or now - _STATIC_CACHE["ts"] > _CACHE_TTL:
        from memory_service import get_business_context, get_learnings_context
        from topic_memory_service import get_topic_memories, detect_topics
        _STATIC_CACHE.update({
            "business": get_business_context(),
            "learnings": get_learnings_context(),
            "topics": get_topic_memories(["financiero", "estrategia", "ventas"]),
            "ts": now,
        })
    return (
        _STATIC_CACHE["business"],
        _STATIC_CACHE["learnings"],
        _STATIC_CACHE["topics"],
    )
```

## Integración en chat.py

```python
# ANTES:
def _collect_context(query_vector, req):
    memory_context = get_semantic_context(query_vector) if req.usar_memoria else ""
    business_ctx   = get_business_context()
    learnings_ctx  = get_learnings_context()
    topics         = detect_topics(req.pregunta)
    topic_memory   = get_topic_memories(topics) if topics else ""
    return memory_context, business_ctx, learnings_ctx, topic_memory

# DESPUÉS:
def _collect_context(query_vector, req):
    memory_context = get_semantic_context(query_vector) if req.usar_memoria else ""
    if req.usar_memoria:
        business_ctx, learnings_ctx, topic_memory = get_static_context()
    else:
        business_ctx = learnings_ctx = topic_memory = ""
    return memory_context, business_ctx, learnings_ctx, topic_memory
```

## Por qué funciona con Anthropic cache

El bloque estático en `claude_service.py` ya tiene `cache_control: ephemeral`.
Con este skill, ese bloque llega **idéntico** en requests consecutivos → hit garantizado.
Sin este skill, si `business_ctx` o `topic_memory` cambia mínimamente entre requests, el cache se invalida.
