'use client'
import { useState } from 'react'
import { Zap, Copy, CheckCircle, ChevronRight } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Lang = 'curl' | 'python' | 'js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function Badge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    POST:   'bg-violet-500/15 text-violet-300 border-violet-500/30',
    GET:    'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    DELETE: 'bg-red-500/15 text-red-300 border-red-500/30',
  }
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${colors[method] ?? ''}`}>
      {method}
    </span>
  )
}

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group">
      <pre className="bg-black/60 border border-white/8 rounded-xl p-4 overflow-x-auto text-xs leading-relaxed font-mono text-white/70">
        <code>{code}</code>
      </pre>
      <button onClick={copy}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
        {copied
          ? <CheckCircle size={13} className="text-green-400" />
          : <Copy size={13} className="text-white/40" />}
      </button>
    </div>
  )
}

function LangTabs({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const tabs: Lang[] = ['curl', 'python', 'js']
  return (
    <div className="flex gap-1 mb-3">
      {tabs.map(t => (
        <button key={t} onClick={() => setLang(t)}
          className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
            lang === t ? 'bg-violet-600 text-white' : 'text-white/30 hover:text-white/60'
          }`}>
          {t === 'js' ? 'node.js' : t}
        </button>
      ))}
    </div>
  )
}

// ── Section components ────────────────────────────────────────────────────────

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-lg font-bold text-white mt-12 mb-4 scroll-mt-24 flex items-center gap-2">
      <span className="w-1 h-5 bg-violet-500 rounded-full inline-block"/>
      {children}
    </h2>
  )
}

function Endpoint({ method, path, description }: { method: string; path: string; description: string }) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <Badge method={method} />
      <div>
        <code className="text-sm font-mono text-white">{path}</code>
        <p className="text-xs text-white/40 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function Param({ name, type, required, children }: {
  name: string; type: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <tr className="border-b border-white/5">
      <td className="py-2 pr-4">
        <code className="text-xs text-violet-300">{name}</code>
        {required && <span className="ml-1 text-[10px] text-red-400">*</span>}
      </td>
      <td className="py-2 pr-4">
        <span className="text-[11px] text-white/30 font-mono">{type}</span>
      </td>
      <td className="py-2 text-xs text-white/50">{children}</td>
    </tr>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [askLang,    setAskLang]    = useState<Lang>('curl')
  const [streamLang, setStreamLang] = useState<Lang>('curl')
  const [uploadLang, setUploadLang] = useState<Lang>('curl')

  const BASE = 'https://sinergy.io'
  const KEY  = 'sk-sy-••••••••••••••••••••••'

  const askCode: Record<Lang, string> = {
    curl: `curl -X POST ${BASE}/chat/ask \\
  -H "X-API-Key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "pregunta": "¿Cuál es el estado del proyecto X?",
    "top_k": 5
  }'`,
    python: `import requests

response = requests.post(
    "${BASE}/chat/ask",
    headers={"X-API-Key": "${KEY}"},
    json={"pregunta": "¿Cuál es el estado del proyecto X?", "top_k": 5},
)
data = response.json()
print(data["respuesta"])`,
    js: `const res = await fetch("${BASE}/chat/ask", {
  method: "POST",
  headers: {
    "X-API-Key": "${KEY}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    pregunta: "¿Cuál es el estado del proyecto X?",
    top_k: 5,
  }),
});
const { respuesta, modo, modelo } = await res.json();`,
  }

  const streamCode: Record<Lang, string> = {
    curl: `curl -X POST ${BASE}/chat/stream \\
  -H "X-API-Key: ${KEY}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: text/event-stream" \\
  -d '{"pregunta": "Analiza el contrato adjunto", "modo": "complejo"}' \\
  --no-buffer`,
    python: `import httpx

with httpx.stream(
    "POST", "${BASE}/chat/stream",
    headers={"X-API-Key": "${KEY}"},
    json={"pregunta": "Analiza el contrato adjunto"},
) as r:
    for chunk in r.iter_text():
        print(chunk, end="", flush=True)`,
    js: `const res = await fetch("${BASE}/chat/stream", {
  method: "POST",
  headers: { "X-API-Key": "${KEY}", "Content-Type": "application/json" },
  body: JSON.stringify({ pregunta: "Analiza el contrato adjunto" }),
});
const reader = res.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  process.stdout.write(decoder.decode(value));
}`,
  }

  const uploadCode: Record<Lang, string> = {
    curl: `curl -X POST ${BASE}/docs/upload \\
  -H "X-API-Key: ${KEY}" \\
  -F "file=@contrato_q1.pdf" \\
  -F "categoria=legal"`,
    python: `import requests

with open("contrato_q1.pdf", "rb") as f:
    res = requests.post(
        "${BASE}/docs/upload",
        headers={"X-API-Key": "${KEY}"},
        files={"file": f},
        data={"categoria": "legal"},
    )
print(res.json())`,
    js: `const form = new FormData();
form.append("file", fileInput.files[0]);
form.append("categoria", "legal");

const res = await fetch("${BASE}/docs/upload", {
  method: "POST",
  headers: { "X-API-Key": "${KEY}" },
  body: form,
});
const { chunks_indexados } = await res.json();`,
  }

  const nav = [
    { id: 'auth',     label: 'Autenticación' },
    { id: 'ask',      label: 'POST /chat/ask' },
    { id: 'stream',   label: 'POST /chat/stream' },
    { id: 'upload',   label: 'POST /docs/upload' },
    { id: 'list',     label: 'GET /docs/list' },
    { id: 'models',   label: 'Modelos y planes' },
    { id: 'errors',   label: 'Códigos de error' },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/8 bg-[#0f0f0f]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Zap size={14} className="text-violet-400" />
            </div>
            <span className="font-semibold text-sm">SinergyOS</span>
            <span className="text-white/20 text-sm">/</span>
            <span className="text-white/40 text-sm">API Reference</span>
          </div>
          <a href="/sinergy/register"
            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors">
            Obtener API key <ChevronRight size={12} />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-12">

        {/* Sidebar nav */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24 space-y-0.5">
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3 px-3">Contenido</p>
            {nav.map(n => (
              <a key={n.id} href={`#${n.id}`}
                className="block px-3 py-1.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                {n.label}
              </a>
            ))}
            <div className="pt-4 px-3">
              <div className="rounded-lg bg-violet-600/10 border border-violet-500/20 p-3">
                <p className="text-[11px] text-violet-300 font-semibold mb-1">Base URL</p>
                <code className="text-[11px] text-white/50 break-all">sinergy.io</code>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-3xl">

          {/* Hero */}
          <div className="mb-10">
            <h1 className="text-3xl font-black text-white mb-3">API Reference</h1>
            <p className="text-white/40 leading-relaxed max-w-xl">
              SinergyOS expone una API REST simple para integrar agentes IA con memoria semántica
              y contexto de documentos en cualquier aplicación. Autenticación por header, respuestas en JSON.
            </p>
          </div>

          {/* Quick start */}
          <div className="rounded-2xl border border-violet-500/20 bg-violet-600/5 p-5 mb-10">
            <p className="text-xs text-violet-400 uppercase tracking-widest mb-3 font-semibold">Quick start — 30 segundos</p>
            <CodeBlock lang="bash" code={`curl -X POST https://sinergy.io/chat/ask \\
  -H "X-API-Key: sk-sy-TU_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"pregunta": "¿Qué puedes hacer?"}'`} />
          </div>

          {/* ── Auth ── */}
          <SectionTitle id="auth">Autenticación</SectionTitle>
          <p className="text-sm text-white/50 mb-4 leading-relaxed">
            Todas las requests deben incluir el header <code className="text-violet-300 text-xs bg-white/5 px-1.5 py-0.5 rounded">X-API-Key</code> con
            tu API key. La obtienes al registrarte — solo se muestra una vez.
          </p>
          <CodeBlock code={`X-API-Key: sk-sy-••••••••••••••••••••••••••••••••`} />
          <div className="mt-4 rounded-xl border border-white/8 bg-[#1a1a1a] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-2.5 text-[11px] text-white/30 uppercase tracking-wider font-medium w-24">Status</th>
                  <th className="text-left px-4 py-2.5 text-[11px] text-white/30 uppercase tracking-wider font-medium">Significado</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['401', 'API key inválida o inexistente'],
                  ['402', 'Cuenta pendiente de pago o suspendida'],
                  ['429', 'Límite mensual del plan alcanzado'],
                ].map(([code, msg]) => (
                  <tr key={code} className="border-b border-white/5">
                    <td className="px-4 py-2.5"><code className="text-xs text-red-400">{code}</code></td>
                    <td className="px-4 py-2.5 text-xs text-white/50">{msg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Ask ── */}
          <SectionTitle id="ask">Chat — Pregunta directa</SectionTitle>
          <Endpoint method="POST" path="/chat/ask" description="Envía una pregunta y recibe la respuesta completa en JSON." />
          <div className="mt-4 mb-4 rounded-xl border border-white/8 bg-[#1a1a1a] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-2.5 text-[11px] text-white/30 uppercase tracking-wider font-medium">Campo</th>
                  <th className="text-left px-4 py-2.5 text-[11px] text-white/30 uppercase tracking-wider font-medium">Tipo</th>
                  <th className="text-left px-4 py-2.5 text-[11px] text-white/30 uppercase tracking-wider font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody>
                <Param name="pregunta" type="string" required>La pregunta o instrucción para el agente.</Param>
                <Param name="top_k" type="number">Documentos a consultar (default: 5, max: 20).</Param>
                <Param name="modo" type="string">Forzar modelo: <code className="text-violet-300 text-xs">simple</code> · <code className="text-violet-300 text-xs">medio</code> · <code className="text-violet-300 text-xs">complejo</code> · <code className="text-violet-300 text-xs">agente</code>. Auto si no se envía.</Param>
                <Param name="categoria" type="string">Filtrar docs por categoría: <code className="text-violet-300 text-xs">legal</code> · <code className="text-violet-300 text-xs">finanzas</code> · <code className="text-violet-300 text-xs">general</code> · <code className="text-violet-300 text-xs">rh</code> · <code className="text-violet-300 text-xs">operaciones</code>.</Param>
                <Param name="session_id" type="string">ID de sesión para mantener historial de conversación.</Param>
              </tbody>
            </table>
          </div>
          <LangTabs lang={askLang} setLang={setAskLang} />
          <CodeBlock code={askCode[askLang]} />
          <p className="text-xs text-white/30 mt-3 mb-2">Respuesta</p>
          <CodeBlock code={`{
  "respuesta":         "El proyecto X está en fase de pruebas...",
  "modo":              "simple",
  "modelo":            "GPT-4o-mini",
  "fuentes_consultadas": 3,
  "fuentes": [
    { "archivo": "proyecto_x.pdf", "categoria": "general", "relevancia": 0.87 }
  ]
}`} />

          {/* ── Stream ── */}
          <SectionTitle id="stream">Chat — Streaming</SectionTitle>
          <Endpoint method="POST" path="/chat/stream" description="Mismos parámetros que /ask. Devuelve Server-Sent Events (text/event-stream) para mostrar la respuesta token a token." />
          <div className="mt-3 mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <p className="text-xs text-amber-400/80">
              Agrega el header <code className="text-amber-300">Accept: text/event-stream</code> y desactiva el buffering del cliente.
              Cada chunk llega como texto plano; el stream termina con el token <code className="text-amber-300">[DONE]</code>.
            </p>
          </div>
          <LangTabs lang={streamLang} setLang={setStreamLang} />
          <CodeBlock code={streamCode[streamLang]} />

          {/* ── Upload ── */}
          <SectionTitle id="upload">Documentos — Subir archivo</SectionTitle>
          <Endpoint method="POST" path="/docs/upload" description="Indexa un archivo en la colección privada del tenant. Soporta PDF, DOCX, XLSX, TXT, CSV, MD." />
          <div className="mt-4 mb-4 rounded-xl border border-white/8 bg-[#1a1a1a] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-2.5 text-[11px] text-white/30 uppercase tracking-wider font-medium">Campo</th>
                  <th className="text-left px-4 py-2.5 text-[11px] text-white/30 uppercase tracking-wider font-medium">Tipo</th>
                  <th className="text-left px-4 py-2.5 text-[11px] text-white/30 uppercase tracking-wider font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody>
                <Param name="file" type="File" required>Archivo a indexar (multipart/form-data).</Param>
                <Param name="categoria" type="string">Categoría del documento (default: <code className="text-violet-300 text-xs">general</code>).</Param>
              </tbody>
            </table>
          </div>
          <LangTabs lang={uploadLang} setLang={setUploadLang} />
          <CodeBlock code={uploadCode[uploadLang]} />
          <p className="text-xs text-white/30 mt-3 mb-2">Respuesta</p>
          <CodeBlock code={`{
  "status":           "ok",
  "archivo":          "contrato_q1.pdf",
  "categoria":        "legal",
  "chunks_indexados": 14,
  "coleccion":        "sinergy_miempresa"
}`} />

          {/* ── List ── */}
          <SectionTitle id="list">Documentos — Listar</SectionTitle>
          <Endpoint method="GET" path="/docs/list" description="Devuelve todos los documentos indexados del tenant." />
          <div className="mt-3 mb-2">
            <CodeBlock code={`curl ${BASE}/docs/list \\
  -H "X-API-Key: ${KEY}"`} />
          </div>
          <p className="text-xs text-white/30 mt-3 mb-2">Respuesta</p>
          <CodeBlock code={`{
  "documentos": [
    { "archivo": "contrato_q1.pdf", "categoria": "legal",   "ruta": "..." },
    { "archivo": "plan_ventas.xlsx", "categoria": "finanzas", "ruta": "..." }
  ]
}`} />

          {/* ── Models ── */}
          <SectionTitle id="models">Modelos y planes</SectionTitle>
          <p className="text-sm text-white/50 mb-4">
            SinergyOS enruta automáticamente cada pregunta al modelo óptimo según su complejidad.
            Puedes forzar un modelo con el campo <code className="text-violet-300 text-xs bg-white/5 px-1.5 py-0.5 rounded">modo</code>.
          </p>
          <div className="rounded-xl border border-white/8 bg-[#1a1a1a] overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Modo', 'Modelo', 'Cuándo se usa'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] text-white/30 uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['simple',  'GPT-4o-mini',    'Preguntas directas, resúmenes cortos'],
                  ['medio',   'GPT-4o',          'Análisis, redacción, comparaciones'],
                  ['complejo','Claude Sonnet',   'Razonamiento profundo, documentos extensos'],
                  ['agente',  'GPT-4o + Tools',  'Búsquedas, cálculos, tareas multi-paso'],
                ].map(([modo, model, when]) => (
                  <tr key={modo} className="border-b border-white/5">
                    <td className="px-4 py-2.5"><code className="text-xs text-violet-300">{modo}</code></td>
                    <td className="px-4 py-2.5 text-xs text-white/60">{model}</td>
                    <td className="px-4 py-2.5 text-xs text-white/40">{when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { plan: 'Basic',      price: '$49',    limit: '500 req/mes',    color: '#6b7280' },
              { plan: 'Pro',        price: '$199',   limit: '5,000 req/mes',  color: '#f59e0b' },
              { plan: 'Enterprise', price: 'Custom', limit: 'Sin límite',     color: '#8b5cf6' },
            ].map(p => (
              <div key={p.plan} className="rounded-xl border border-white/8 bg-[#1a1a1a] p-4">
                <p className="text-xs text-white/30 mb-1">{p.plan}</p>
                <p className="text-xl font-bold" style={{ color: p.color }}>{p.price}</p>
                <p className="text-xs text-white/30 mt-1">{p.limit}</p>
              </div>
            ))}
          </div>

          {/* ── Errors ── */}
          <SectionTitle id="errors">Códigos de error</SectionTitle>
          <div className="rounded-xl border border-white/8 bg-[#1a1a1a] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Código', 'Error', 'Solución'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] text-white/30 uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['400', 'Bad Request',           'Verifica los campos requeridos del body.'],
                  ['401', 'Unauthorized',           'API key inválida o no enviada.'],
                  ['402', 'Payment Required',       'Completa el pago o verifica tu suscripción.'],
                  ['415', 'Unsupported Media Type', 'Formato de archivo no soportado.'],
                  ['422', 'Unprocessable Entity',   'El archivo no pudo ser procesado.'],
                  ['429', 'Too Many Requests',      'Límite mensual alcanzado. Espera el reset o haz upgrade.'],
                  ['503', 'Service Unavailable',    'Brain temporalmente no disponible. Reintenta en segundos.'],
                ].map(([code, error, fix]) => (
                  <tr key={code} className="border-b border-white/5">
                    <td className="px-4 py-2.5"><code className="text-xs text-red-400">{code}</code></td>
                    <td className="px-4 py-2.5 text-xs text-white/50">{error}</td>
                    <td className="px-4 py-2.5 text-xs text-white/35">{fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer CTA */}
          <div className="mt-12 rounded-2xl border border-violet-500/20 bg-violet-600/5 p-8 text-center">
            <h3 className="text-lg font-bold text-white mb-2">¿Listo para integrar?</h3>
            <p className="text-white/40 text-sm mb-5">Regístrate, elige tu plan y obtén tu API key en 2 minutos.</p>
            <a href="/sinergy/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-sm">
              Empezar gratis <ChevronRight size={14} />
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-xs text-white/20 flex items-center justify-between">
            <span>SinergyOS API v1</span>
            <a href="mailto:agarza@bion-business.com" className="hover:text-white/50 transition-colors">Soporte →</a>
          </div>

        </main>
      </div>
    </div>
  )
}
