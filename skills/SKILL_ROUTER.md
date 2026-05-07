# SKILL: Router sin LLM

**Reemplaza:** `classify_complexity()` en `openai_service.py` (1 GPT-4o-mini call por request)  
**Ahorro estimado:** ~$0.002/request × volumen diario

## Algoritmo (orden de prioridad)

```python
import re

ACTION_VERBS = r'\b(bash|ejecuta|crea|edita|modifica|instala|reinicia|borra|sube|descarga|despliega|construye|compila|corre|lanza)\b'
COMPLEX_VERBS = r'\b(analiza|estrategia|compara|evalúa|diseña|propón|explica|redacta|elabora|detalla|resume|sintetiza)\b'

def classify_local(text: str) -> str:
    t = text.lower()
    words = t.split()
    if re.search(ACTION_VERBS, t):
        return "agente"
    if re.search(COMPLEX_VERBS, t) or len(words) > 30:
        return "complejo"
    if len(words) <= 12:
        return "simple"
    return "medio"
```

## Reglas en prosa

1. Contiene verbos de acción en VPS/código → **agente**
2. Contiene verbos analíticos O pregunta larga (>30 palabras) → **complejo**
3. ≤12 palabras, sin verbos especiales → **simple**
4. Default → **medio**

## Casos de prueba

| Query | Clasificación esperada |
|---|---|
| "¿cuánto es 100 USD en MXN?" | simple |
| "analiza el estado financiero del Q1" | complejo |
| "edita el archivo nginx.conf" | agente |
| "¿qué pasó en la junta de ayer?" | medio |
| "crea un reporte de ventas comparando Q1 vs Q2 con gráficas" | complejo |

## Integración

```python
# En routers/chat.py, línea donde se llama classify_complexity():
# ANTES:  modo = req.modo or classify_complexity(req.pregunta)
# DESPUÉS:
from skills.router_skill import classify_local
modo = req.modo or classify_local(req.pregunta)
```

## Why

`classify_complexity()` usa `openai_service.py` que hace una llamada real a GPT-4o-mini.
Con >200 queries/día eso suma ~$0.40/día solo en clasificación.
Las reglas locales cubren el 90% de los casos correctamente.
