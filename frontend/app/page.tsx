'use client'
import Link from 'next/link'
import { Zap, Brain, Shield, BarChart3, ArrowRight, Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Básico',
    price: '$19',
    period: '/mes',
    desc: 'Para equipos que quieren empezar con IA sin inversión de riesgo.',
    features: [
      '1 agente personalizado',
      '500 requests / mes',
      '3 Skills predefinidas',
      'RAG con hasta 20 documentos',
      'Dashboard de conversaciones',
    ],
    cta: 'Empezar gratis',
    highlight: false,
    href: '/register?plan=basic',
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/mes',
    desc: 'Para empresas que necesitan agentes especializados y automatizaciones.',
    features: [
      '5 agentes configurables',
      '5,000 requests / mes',
      'Skills personalizadas (editor visual)',
      'API REST propia con API keys',
      'Integración Telegram + n8n',
      'Dashboard de costos en tiempo real',
      '3 usuarios incluidos',
    ],
    cta: 'Comenzar Pro',
    highlight: true,
    href: '/register?plan=pro',
  },
  {
    name: 'Enterprise',
    price: '$299',
    period: '/mes',
    desc: 'Para organizaciones que requieren control total y escala.',
    features: [
      'Agentes ilimitados',
      '50,000 requests / mes',
      'White-label (logo propio)',
      'Multi-tenant aislado',
      'SLA 99.9%',
      'Onboarding dedicado',
      'Soporte prioritario',
    ],
    cta: 'Hablar con ventas',
    highlight: false,
    href: '/register?plan=enterprise',
  },
]

const FEATURES = [
  {
    icon: Brain,
    title: 'Routing inteligente de modelos',
    desc: 'GPT-4o-mini para queries rápidas, GPT-4o para análisis, Claude Sonnet para decisiones complejas. Calidad máxima al menor costo.',
  },
  {
    icon: Zap,
    title: 'Skills por industria',
    desc: 'Módulos especializados para finanzas, RRHH, ventas, ISO 9001, legal y más. Tu agente habla el idioma de tu negocio.',
  },
  {
    icon: Shield,
    title: 'Memoria empresarial',
    desc: 'RAG semántico sobre tus documentos internos + memoria de conversaciones. El agente aprende y recuerda.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard de costos real',
    desc: 'Tracking de tokens, ahorro vs baseline y ROI por tema. Sabés exactamente cuánto cuesta cada decisión.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">

      {/* Nav */}
      <nav className="border-b border-[#1e1e1e] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-semibold text-lg tracking-tight">SinergyOS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-[#888] hover:text-white transition-colors">Dashboard</Link>
          <Link href="/register" className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors">
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-6">
          <Zap size={12} />
          Construido sobre MolloIA — en producción desde 2026
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-white leading-tight mb-6">
          Agentes IA que entienden<br />
          <span className="text-indigo-400">tu negocio</span>
        </h1>
        <p className="text-xl text-[#888] max-w-2xl mx-auto mb-10">
          Crea agentes ejecutivos personalizados con memoria empresarial, documentos internos y Skills por industria.
          Sin código. Con control total de costos.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Crear mi agente gratis <ArrowRight size={16} />
          </Link>
          <Link href="/dashboard" className="text-sm text-[#888] hover:text-white transition-colors px-4 py-3">
            Ver demo →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <f.icon size={18} className="text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
              </div>
              <p className="text-[#888] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-16" id="precios">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Precios simples y transparentes</h2>
          <p className="text-[#888]">Sin sorpresas. Pagas por lo que usas. Cancela cuando quieras.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-[#1a1a1a] rounded-2xl p-6 border transition-all ${
                plan.highlight
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'border-[#2e2e2e] hover:border-[#3e3e3e]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Más popular
                  </span>
                </div>
              )}
              <div className="mb-5">
                <h3 className="font-semibold text-white mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-[#666] text-sm mb-1">{plan.period}</span>
                </div>
                <p className="text-[#888] text-sm">{plan.desc}</p>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <Check size={15} className="text-indigo-400 mt-0.5 shrink-0" />
                    <span className="text-[#ccc]">{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    : 'bg-[#242424] hover:bg-[#2e2e2e] text-white border border-[#2e2e2e]'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e1e] mt-16 py-8 text-center text-[#555] text-sm">
        <p>SinergyOS v0.1 · Construido sobre MolloIA · {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
