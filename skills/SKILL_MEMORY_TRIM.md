# SKILL: Memory Trim — Eliminar mollo_memory.json como fuente primaria

**Problema:** `mollo_memory.json` = 151KB en disco (crece indefinidamente)  
**Riesgo:** Si `memory_service.py` carga el JSON completo, son hasta ~37,000 tokens potenciales  
**Solución:** Qdrant `mollo_memoria` collection ya existe — usarla exclusivamente

## Diagnóstico

```bash
# Verificar que la collection existe
curl -s http://localhost:6333/collections/mollo_memoria | python3 -m json.tool | grep -E 'status|vectors_count'
```

## Regla

`memory_service.get_semantic_context()` debe hacer búsqueda semántica en Qdrant,
NO cargar `mollo_memory.json` en memoria.

Límite duro: top_k=3, score_threshold=0.72, max 800 tokens en el bloque `memory_context`.

## Implementación

```python
# En memory_service.py — reemplazar carga JSON por:
from qdrant_service import search_memory  # si existe, o usar search() con collection override

def get_semantic_context(query_vector: list, max_tokens: int = 800) -> str:
    results = search_memory(query_vector, top_k=3, score_threshold=0.72)
    if not results:
        return ""
    snippets = []
    total = 0
    for r in results:
        text = r.payload.get("content", "")
        approx_tokens = len(text) // 4
        if total + approx_tokens > max_tokens:
            break
        snippets.append(text)
        total += approx_tokens
    return "\n---\n".join(snippets)
```

## Migración de mollo_memory.json → Qdrant

```bash
# Script de migración (ejecutar una vez)
cd /root/mollo_brain
python3 - << 'EOF'
import json
from qdrant_service import ensure_memory_collection
# Ver qué hay en el JSON
with open("mollo_memory.json") as f:
    data = json.load(f)
print(f"Entradas en memoria: {len(data) if isinstance(data, list) else 'dict'}")
print(f"Tipo: {type(data)}")
if isinstance(data, list):
    print(f"Primera entrada: {str(data[0])[:200]}")
elif isinstance(data, dict):
    print(f"Keys: {list(data.keys())[:10]}")
EOF
```

## After

Una vez migrado: archivar `mollo_memory.json` → `mollo_memory.json.bak`
El archivo JSON puede seguir existiendo como backup pero no como fuente de lectura.
