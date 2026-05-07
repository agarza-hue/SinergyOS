'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bot, Plus, Zap, MessageSquare, BarChart3, Settings,
  TrendingDown, Activity, ChevronRight, BookOpen,
} from 'lucide-react'

const BRAIN = 'http://localhost:8002'

interface Agent {
  id: string
  name: string
  industry: string
  skills: string[]
  requests_used: number
  requests_limit: number
  last_active: string
  status: 'active' | 'idle'
}

interface CostSummary {
  total_queries: number
  actual_cost: number
  baseline_cost: number
  savings: number
  savings_pct: number
}

// Agentes demo (luego vendrán de sinergy_tenants)
const DEMO_AGENTS: Agent[] = [
  {
    id: 'mollo',
    name: 'Mollo',
    industry: 'Estrategia · Finanzas · VPS',
    skills: ['SKILL_ROUTER', 'SKILL_CONTEXT_CACHE', 'SKILL_MEMORY_TRIM'],
    requests_used: 0,
    requests_limit: 999999,
    last_active: 'Ahora',
    status: 'active',
  },
]

function StatCard({ label, value, sub, icon: Icon, accent = false }: {
  label: string; value: string; sub?: string; icon: React.ElementType; accent?: boolean
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#666] uppercase tracking-wider">{label}</span>
        <Icon size={15} className={accent ? 'text-indigo-400' : 'text-[#444]'} />
      </div>
      <div className={`text-2xl font-bold ${accent ? 'text-indigo-400' : 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-[#555] mt-1">{sub}</div>}
    </div>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  const pct = agent.requests_limit < 999999
    ? Math.round((agent.requests_used / agent.requests_limit) * 100)
    : 0

  return (
    <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 hover:border-indigo-500/40 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
            <Bot size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{agent.name}</h3>
            <p className="text-xs text-[#666]">{agent.industry}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
          agent.status === 'active'
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-[#242424] text-[#555]'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-emerald-400' : 'bg-[#444]'}`} />
          {agent.status === 'active' ? 'Activo' : 'Inactivo'}
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {agent.skills.map((s) => (
          <span key={s} className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
            {s}
          </span>
        ))}
      </div>

      {/* Usage bar */}
      {agent.requests_limit < 999999 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#555] mb-1">
            <span>{agent.requests_used.toLocaleString()} requests</span>
            <span>{pct}% de {agent.requests_limit.toLocaleString()}</span>
          </div>
          <div className="w-full h-1.5 bg-[#242424] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={`/mollo`}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <MessageSquare size={13} /> Chat
        </Link>
        <button className="flex items-center gap-1.5 text-xs bg-[#242424] hover:bg-[#2e2e2e] text-[#888] px-3 py-2 rounded-lg transition-colors border border-[#2e2e2e]">
          <Settings size={13} /> Config
        </button>
      </div>
    </div>
  )
}

export default function DashboardClient() {
  const [costs, setCosts] = useState<CostSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BRAIN}/costs/summary`)
      .then((r) => r.json())
      .then(setCosts)
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-56 bg-[#0a0a0a] border-r border-[#1e1e1e] flex flex-col">
        <div className="p-4 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="font-semibold text-sm">SinergyOS</span>
          </div>
        </div>

        <nav className="p-3 flex-1">
          {[
            { icon: Activity,      label: 'Dashboard',  href: '/dashboard', active: true  },
            { icon: Bot,           label: 'Agentes',    href: '/dashboard', active: false },
            { icon: BookOpen,      label: 'Skills',     href: '/dashboard', active: false },
            { icon: BarChart3,     label: 'Costos',     href: '/dashboard', active: false },
            { icon: Settings,      label: 'Config',     href: '/dashboard', active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                item.active
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-[#666] hover:text-[#aaa] hover:bg-[#141414]'
              }`}
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-[#1e1e1e]">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs text-white font-bold">A</div>
            <div>
              <div className="text-xs text-white font-medium">Adolfo</div>
              <div className="text-[10px] text-[#555]">Enterprise</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 p-6">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            <p className="text-sm text-[#666] mt-0.5">Vista general de tus agentes y costos de IA</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Agentes activos"
              value={String(DEMO_AGENTS.filter(a => a.status === 'active').length)}
              sub="de 1 total"
              icon={Bot}
              accent
            />
            <StatCard
              label="Requests (30d)"
              value={costs ? costs.total_queries.toLocaleString() : '—'}
              sub="histórico"
              icon={MessageSquare}
            />
            <StatCard
              label="Costo real (30d)"
              value={costs ? `$${costs.actual_cost.toFixed(2)}` : '—'}
              sub={costs ? `baseline $${costs.baseline_cost.toFixed(2)}` : undefined}
              icon={BarChart3}
            />
            <StatCard
              label="Ahorro vs Claude"
              value={costs ? `${costs.savings_pct}%` : '—'}
              sub={costs ? `$${costs.savings.toFixed(2)} ahorrados` : undefined}
              icon={TrendingDown}
              accent
            />
          </div>

          {/* Agents */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#aaa] uppercase tracking-wider">Mis Agentes</h2>
            <button className="flex items-center gap-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/20">
              <Plus size={13} /> Nuevo agente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {DEMO_AGENTS.map((a) => <AgentCard key={a.id} agent={a} />)}

            {/* Placeholder para nuevo agente */}
            <div className="bg-[#141414] border border-dashed border-[#2e2e2e] rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center hover:border-indigo-500/30 transition-colors cursor-pointer min-h-[200px]">
              <div className="w-10 h-10 bg-[#1e1e1e] rounded-xl flex items-center justify-center">
                <Plus size={20} className="text-[#444]" />
              </div>
              <div>
                <p className="text-sm text-[#555] font-medium">Nuevo agente</p>
                <p className="text-xs text-[#444] mt-0.5">Configura skills, documentos y modelo</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2e2e2e]">
              <h3 className="text-sm font-medium text-[#aaa]">Accesos rápidos</h3>
            </div>
            {[
              { label: 'Ver dashboard de costos completo', href: '/mollo/dashboard', icon: BarChart3 },
              { label: 'Abrir Mollo — chat ejecutivo',     href: '/mollo',           icon: MessageSquare },
              { label: 'Gestión de Skills InsForge',       href: '#',                icon: Zap },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center justify-between px-5 py-3 hover:bg-[#222] transition-colors border-b border-[#1e1e1e] last:border-0"
              >
                <div className="flex items-center gap-3 text-sm text-[#888]">
                  <link.icon size={15} className="text-[#444]" />
                  {link.label}
                </div>
                <ChevronRight size={14} className="text-[#444]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
