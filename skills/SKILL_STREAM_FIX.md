# SKILL: Stream Agent Fix — Streaming real en modo agente Claude

**Problema:** `stream_agent()` en `claude_service.py` usa `client.messages.create()` (síncrono)  
**Síntoma:** El usuario ve el spinner durante toda la ejecución de herramientas, no hay streaming parcial  
**Impacto:** UX degradada en queries complejas con múltiples tool calls

## El bug (líneas 192-235 de claude_service.py)

```python
# stream_agent usa el cliente SÍNCRONO — no hace streaming real
response = client.messages.create(  # ← SÍNCRONO
    model=CLAUDE_MODEL,
    max_tokens=8096,
    system=_SYSTEM_CACHED,
    tools=TOOLS,
    messages=messages,
)
# Solo hace yield después de que la respuesta completa llega
yield f"\n_🔧 Ejecutando: {block.name}…_\n"
```

## Fix: usar async_client con streaming real para la respuesta final

```python
async def stream_agent(pregunta, doc_context="", memory_context="",
                       business_context="", learnings_context="", topic_memory=""):
    from tools_service import TOOLS, execute_tool
    import json as _json

    messages = _build_messages(
        pregunta, doc_context, memory_context, business_context, learnings_context, topic_memory
    )
    total_input = total_output = 0

    for _ in range(MAX_AGENT_ITERATIONS):
        # Tool use: síncrono (necesitamos la lista completa de tool_calls)
        response = client.messages.create(
            model=CLAUDE_MODEL, max_tokens=8096,
            system=_SYSTEM_CACHED, tools=TOOLS, messages=messages,
        )
        total_input  += response.usage.input_tokens
        total_output += response.usage.output_tokens

        if response.stop_reason == "end_turn":
            # Respuesta final: stream real
            async with async_client.messages.stream(
                model=CLAUDE_MODEL, max_tokens=8096,
                system=_SYSTEM_CACHED, messages=messages + [
                    {"role": "assistant", "content": [
                        {"type": "text", "text": "Dame un momento para resumir."}
                    ]}
                ],
            ) as s:
                async for text in s.text_stream:
                    yield text
            break

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    yield f"\n_🔧 {block.name}…_\n"
                    result = await execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(result),
                    })
            messages.append({"role": "user", "content": tool_results})
        else:
            break

    usage = {"input_tokens": total_input, "output_tokens": total_output,
             "cache_read_tokens": 0, "model": CLAUDE_MODEL}
    yield f"\x03{_json.dumps(usage)}"
```

## Prioridad

Media — no afecta costo, sí afecta UX en modo agente.
Implementar después de SKILL_ROUTER y SKILL_CONTEXT_CACHE.
