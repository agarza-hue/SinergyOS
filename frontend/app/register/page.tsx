'use client'
import { useState, FormEvent } from 'react'
import { CheckCircle, Copy, Zap, Shield, Building2, Mail, ChevronRight, Loader2, AlertCircle } from 'lucide-react'

const PLANS = [
  {
    id: 'basic',
    label: 'Basic',
    price: '$49',
    period: '/mes',
    limit: '500 requests/mes',
    color: '#6b7280',
    features: ['500 requests mensuales', 'Acceso a GPT-4o-mini', 'Soporte por email', 'Dashboard de métricas'],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '$199',
    period: '/mes',
    limit: '5,000 requests/mes',
    color: '#f59e0b',
    highlight: true,
    features: ['5,000 requests mensuales', 'GPT-4o + Claude Sonnet', 'Soporte prioritario', 'Análisis de documentos', 'Memoria semántica'],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: 'Custom',
    period: '',
    limit: 'Sin límite',
    color: '#8b5cf6',
    features: ['Requests ilimitados', 'Todos los modelos', 'SLA garantizado', 'Onboarding dedicado', 'Integración custom'],
  },
] as const

function fmt$(key: string) {
  return key.substring(0, 12) + '…' + key.substring(key.length - 6)
}

export default function RegisterPage() {
  const [step,    setStep]    = useState<'form' | 'success'>('form')
  const [plan,    setPlan]    = useState<'basic' | 'pro' | 'enterprise'>('pro')
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [result,  setResult]  = useState<{slug:string;api_key:string;plan:string;req_limit:number} | null>(null)
  const [copied,  setCopied]  = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/sinergy/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined, plan }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail ?? data.error ?? 'Error al registrar')
      } else if (data.checkout_url) {
        // Basic / Pro: redirigir a Stripe Checkout
        window.location.href = data.checkout_url
        return
      } else {
        // Enterprise: mostrar key directamente
        setResult(data)
        setStep('success')
      }
    } catch {
      setError('No se pudo conectar con el servidor')
    }
    setLoading(false)
  }

  function copyKey() {
    if (!result) return
    navigator.clipboard.writeText(result.api_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  if (step === 'success' && result) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Success header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-400"/>
            </div>
            <h1 className="text-2xl font-bold text-white">¡Cuenta creada!</h1>
            <p className="text-white/40 text-sm mt-1">Guarda tu API key — no se vuelve a mostrar</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#1a1a1a] p-6 space-y-5">
            {/* API Key — lo más importante */}
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Tu API Key</p>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                <code className="flex-1 text-green-400 text-sm font-mono break-all">{result.api_key}</code>
                <button onClick={copyKey}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  {copied
                    ? <CheckCircle size={16} className="text-green-400"/>
                    : <Copy size={16} className="text-white/40 hover:text-white"/>}
                </button>
              </div>
              <p className="text-[11px] text-amber-400/70 mt-2 flex items-center gap-1">
                <AlertCircle size={11}/> Copia y guarda esta key ahora. No podrás verla de nuevo.
              </p>
            </div>

            {/* Info del plan */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Empresa', value: name },
                { label: 'Plan',    value: result.plan.charAt(0).toUpperCase() + result.plan.slice(1) },
                { label: 'Límite',  value: result.req_limit >= 999999 ? '∞ requests' : `${result.req_limit.toLocaleString()}/mes` },
              ].map(i => (
                <div key={i.label} className="bg-white/4 rounded-lg p-3">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{i.label}</p>
                  <p className="text-sm font-semibold text-white truncate">{i.value}</p>
                </div>
              ))}
            </div>

            {/* Quick start */}
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Integración rápida</p>
              <div className="bg-black/50 rounded-xl p-4 font-mono text-xs space-y-2 border border-white/5">
                <p className="text-white/30"># Enviar una consulta</p>
                <p><span className="text-amber-400">curl</span> <span className="text-white/60">-X POST https://sinergy.io/chat/ask</span></p>
                <p className="text-white/60 pl-2">-H <span className="text-green-400">&quot;X-API-Key: {fmt$(result.api_key)}&quot;</span></p>
                <p className="text-white/60 pl-2">-H <span className="text-green-400">&quot;Content-Type: application/json&quot;</span></p>
                <p className="text-white/60 pl-2">-d <span className="text-blue-400">&apos;&#123;&quot;pregunta&quot;: &quot;¿Cuál es el plan de ventas?&quot;&#125;&apos;</span></p>
              </div>
            </div>

            <a href="/sinergy/"
              className="block w-full text-center py-2.5 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors">
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Header */}
      <div className="border-b border-white/8 bg-[#171717]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Zap size={14} className="text-violet-400"/>
            </div>
            <span className="font-semibold text-sm">SinergyOS</span>
          </div>
          <a href="/sinergy/login" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Ya tengo cuenta →
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-3">
            Empieza en <span className="text-violet-400">2 minutos</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Conecta la inteligencia de MolloIA a tu empresa. Elige tu plan, obtén tu API key y empieza a consultar.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Plans */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Elige tu plan</p>
            {PLANS.map(p => (
              <button key={p.id} onClick={() => setPlan(p.id as typeof plan)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  plan === p.id
                    ? 'border-opacity-50 bg-opacity-10'
                    : 'border-white/8 bg-[#1a1a1a] hover:border-white/15'
                }`}
                style={plan === p.id ? { borderColor: p.color, backgroundColor: `${p.color}10` } : {}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center`}
                      style={{ borderColor: plan === p.id ? p.color : 'rgba(255,255,255,0.15)' }}>
                      {plan === p.id && <div className="w-2 h-2 rounded-full" style={{ background: p.color }}/>}
                    </div>
                    <div>
                      <span className="font-semibold text-white">{p.label}</span>
                      {'highlight' in p && p.highlight && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: `${p.color}25`, color: p.color }}>Popular</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg" style={{ color: p.color }}>{p.price}</span>
                    <span className="text-white/30 text-xs">{p.period}</span>
                  </div>
                </div>
                <div className="mt-3 pl-7">
                  <p className="text-xs text-white/30 mb-2">{p.limit}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {p.features.map(f => (
                      <span key={f} className="text-[11px] text-white/40 flex items-center gap-1">
                        <span style={{ color: p.color }}>✓</span> {f}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-white/8 bg-[#1a1a1a] p-6 sticky top-8">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-5">Tus datos</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Empresa *</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"/>
                    <input
                      value={name} onChange={e => setName(e.target.value)}
                      required placeholder="ACME Corp"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/15 focus:outline-none focus:border-violet-500/50 transition-all"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Email (opcional)</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"/>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="tu@empresa.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/15 focus:outline-none focus:border-violet-500/50 transition-all"/>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex items-center justify-between text-xs text-white/30 mb-2">
                    <span>Plan seleccionado</span>
                    <span className="font-semibold" style={{ color: PLANS.find(p=>p.id===plan)?.color }}>
                      {PLANS.find(p=>p.id===plan)?.label} — {PLANS.find(p=>p.id===plan)?.price}
                    </span>
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex items-center gap-1.5">
                    <AlertCircle size={12}/> {error}
                  </p>
                )}

                <button type="submit" disabled={loading || !name.trim()}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  {loading
                    ? <><Loader2 size={15} className="animate-spin"/> Creando cuenta…</>
                    : <><ChevronRight size={15}/> Obtener mi API key</>}
                </button>

                <div className="flex items-center gap-2 justify-center pt-1">
                  <Shield size={11} className="text-white/20"/>
                  <p className="text-[10px] text-white/20">Sin tarjeta. Activo en segundos.</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
