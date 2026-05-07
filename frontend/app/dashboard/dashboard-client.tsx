'use client'

import { useState, useEffect, useCallback } from 'react'
import TopologyTab from './topology-tab'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { TrendingDown, Zap, DollarSign, Activity, RefreshCw, ChevronLeft, Info, Layers, AlertTriangle, CheckCircle, Bell } from 'lucide-react'

// ── AI Logos (SVG) ─────────────────────────────────────────────────────────

function OpenAILogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  )
}

function AnthropicLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-6.454 0h3.603L17.374 20h-3.603L7.373 3.52z"/>
    </svg>
  )
}

function GeminiLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="gem1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4"/>
          <stop offset="50%" stopColor="#9B72CB"/>
          <stop offset="100%" stopColor="#D96570"/>
        </linearGradient>
      </defs>
      <path d="M12 2C12 2 12 10.5 4 12C12 13.5 12 22 12 22C12 22 12 13.5 20 12C12 10.5 12 2 12 2Z" fill="url(#gem1)"/>
    </svg>
  )
}

function MetaLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973.14.604.375 1.176.706 1.65.943 1.372 2.512 2.16 4.174 2.16 1.4 0 2.67-.485 3.752-1.306.92-.696 1.862-1.955 2.888-3.543l1.458-2.34.876 1.32c.286.43.572.86.858 1.275.862 1.246 1.642 2.183 2.47 2.808.95.71 2.058 1.061 3.268 1.061 1.55 0 3.005-.66 4.001-1.84.73-.87 1.339-2.21 1.339-4.432v-.23c0-.768-.088-1.532-.264-2.272A11.474 11.474 0 0 0 24 8.87C22.94 6.227 21.035 4.03 18.36 4.03c-1.23 0-2.5.42-3.731 1.32A18.64 18.64 0 0 0 12 7.81a18.682 18.682 0 0 0-2.63-2.46C8.14 4.45 7.021 4.03 6.915 4.03zm.057 1.969c.63 0 1.476.36 2.442 1.084.66.496 1.344 1.139 2.04 1.86-.577.992-1.154 2.083-1.64 3.04-.588 1.16-1.064 2.144-1.54 2.859-.51.762-1.012 1.334-1.534 1.75-.52.415-1.135.686-1.883.686-.986 0-1.953-.438-2.56-1.311-.387-.548-.603-1.172-.718-1.74C1.49 13.82 1.42 13.14 1.42 14.45c0-2.357.65-4.788 1.733-6.432C4.177 6.553 5.46 5.999 6.972 5.999zm10.988.013c.63 0 1.476.36 2.442 1.084.66.496 1.344 1.139 2.04 1.86-.577.992-1.154 2.083-1.64 3.04-.588 1.16-1.064 2.144-1.54 2.859-.51.762-1.012 1.334-1.534 1.75-.52.415-1.135.686-1.883.686-.986 0-1.953-.438-2.56-1.311-.387-.548-.603-1.172-.718-1.74-.115-.569-.185-1.249-.185.461 0-2.357.65-4.788 1.733-6.432 1.024-1.514 2.307-2.068 3.845-2.068z"/>
    </svg>
  )
}

function MistralLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="2" width="4" height="4" rx="0.5"/>
      <rect x="10" y="2" width="4" height="4" rx="0.5"/>
      <rect x="18" y="2" width="4" height="4" rx="0.5"/>
      <rect x="2" y="10" width="4" height="4" rx="0.5"/>
      <rect x="10" y="10" width="4" height="4" rx="0.5"/>
      <rect x="2" y="18" width="4" height="4" rx="0.5"/>
      <rect x="10" y="18" width="4" height="4" rx="0.5"/>
      <rect x="18" y="10" width="4" height="4" rx="0.5"/>
    </svg>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────

interface LifetimeTotals { queries:number; input_tokens:number|null; output_tokens:number|null; cache_tokens:number|null; actual_cost:number|null; baseline_cost:number|null; savings:number|null; savings_pct:number }
interface ByModel { model:string; modo:string; queries:number; input_tokens:number; output_tokens:number; actual_cost:number; baseline_cost:number; savings:number }
interface ByProvider { provider:string; queries:number; input_tokens:number; output_tokens:number; cache_tokens:number; actual_cost:number; baseline_cost:number; savings:number }
interface ByTopic { topic:string; queries:number; input_tokens:number; output_tokens:number; cache_tokens:number; actual_cost:number; baseline_cost:number; savings:number }
interface TopicByModel { topic:string; model:string; queries:number; total_tokens:number; actual_cost:number; savings:number }
interface DailyRow { day:string; queries:number; total_tokens:number; actual_cost:number; baseline_cost:number; savings:number }
interface RecentRow { id:number; ts:string; model:string; modo:string; input_tokens:number; output_tokens:number; cache_read_tokens:number; actual_cost:number; baseline_cost:number; savings:number; query_preview:string; topic?:string }
interface CostSummary { lifetime:LifetimeTotals; by_model:ByModel[]; last_7_days:DailyRow[] }
interface AnthropicHeaders { input_limit:number; input_remaining:number; input_reset:string; output_limit:number; output_remaining:number; output_reset:string; req_limit:number; req_remaining:number; req_reset:string; tokens_limit:number; tokens_remaining:number; tokens_reset:string; status_code:number }
interface OpenAIHeaders { req_limit:number; req_remaining:number; req_reset:string; tokens_limit:number; tokens_remaining:number; tokens_reset:string; status_code:number }
interface UsageProvider { provider:string; input_tokens:number; output_tokens:number; cache_tokens:number; actual_cost:number; queries:number; first_seen:string }
interface UsageMonth { month:string; provider:string; tokens:number; cost:number; queries:number }
interface LimitsData { ts:string; anthropic:{provider:string;headers:AnthropicHeaders;error:string|null}; openai:{provider:string;headers:OpenAIHeaders;error:string|null}; usage:{by_provider:UsageProvider[];by_month:UsageMonth[];today:{q:number;cost:number}}; cached:boolean; cache_age_s:number }

// ── Topic metadata ─────────────────────────────────────────────────────────

const TOPIC_META: Record<string, { label:string; icon:string; color:string }> = {
  finanzas:       { label:'Finanzas',          icon:'💰', color:'#f59e0b' },
  estrategia:     { label:'Estrategia',        icon:'🎯', color:'#8b5cf6' },
  ventas:         { label:'Ventas',            icon:'📈', color:'#10b981' },
  vps_infra:      { label:'VPS e Infra',       icon:'🖥️', color:'#3b82f6' },
  rrhh:           { label:'RRHH y Equipo',     icon:'👥', color:'#ec4899' },
  proyectos:      { label:'Proyectos',         icon:'📋', color:'#f97316' },
  automatizacion: { label:'Automatización IA', icon:'⚡', color:'#06b6d4' },
  iso9001:        { label:'ISO 9001 Calidad',  icon:'✅', color:'#ef4444' },
  general:        { label:'General',           icon:'💬', color:'#6b7280' },
}

// ── Provider metadata ──────────────────────────────────────────────────────

const PROVIDER_META: Record<string, { color:string; bg:string; Logo: React.FC<{size?:number}> }> = {
  OpenAI:    { color:'#10b981', bg:'#10b98115', Logo: OpenAILogo    },
  Anthropic: { color:'#cf7c50', bg:'#cf7c5015', Logo: AnthropicLogo },
  Google:    { color:'#4285F4', bg:'#4285F415', Logo: GeminiLogo    },
  Meta:      { color:'#1877F2', bg:'#1877F215', Logo: MetaLogo      },
  Mistral:   { color:'#f97316', bg:'#f9731615', Logo: MistralLogo   },
  Otro:      { color:'#6b7280', bg:'#6b728015', Logo: ({ size=20 }) => <span style={{fontSize:size*0.7}}>🤖</span> },
}

// ── Model colors ───────────────────────────────────────────────────────────

const MODEL_COLOR: Record<string,string> = {
  'gpt-4o-mini':'#10b981','gpt-4o':'#3b82f6',
  'claude-sonnet-4-6':'#cf7c50','claude-haiku-4-5':'#f59e0b',
}
const MODEL_LABEL: Record<string,string> = {
  'gpt-4o-mini':'GPT-4o mini','gpt-4o':'GPT-4o',
  'claude-sonnet-4-6':'Claude Sonnet','claude-haiku-4-5':'Claude Haiku',
}

// ── Subscription tiers ─────────────────────────────────────────────────────

const TIERS = {
  claude: {
    label:'Claude — Anthropic', color:'#cf7c50', Logo: AnthropicLogo,
    consumer:[
      { name:'Free',  price:'$0/mes',        highlight:false, features:['~15-25 msgs/día con Sonnet','Claude Haiku sin límite','200k context window','Sin acceso prioritario'] },
      { name:'Pro',   price:'$20/mes',        highlight:true,  features:['5× más uso vs Free','Acceso prioritario','200k context','Claude Opus disponible','Projects y artefactos'] },
      { name:'Team',  price:'$25/user/mes',   highlight:false, features:['Todo de Pro','Límites por usuario más altos','Gestión centralizada','SSO y admin features'] },
    ],
    api:[
      { tier:'T1', req:'$5 cargado',          tpm:'40k',   rpm:'50',    note:'' },
      { tier:'T2', req:'$40 / 30 días',       tpm:'80k',   rpm:'1,000', note:'' },
      { tier:'T3', req:'$200 / 30 días',      tpm:'160k',  rpm:'2,000', note:'' },
      { tier:'T4', req:'$400 / 30 días',      tpm:'400k',  rpm:'4,000', note:'Alta producción' },
    ],
  },
  openai: {
    label:'OpenAI — GPT-4o / o3', color:'#10b981', Logo: OpenAILogo,
    consumer:[
      { name:'Free',   price:'$0/mes',    highlight:false, features:['GPT-4o limitado','GPT-4o-mini ilimitado','128k context','Acceso básico DALL·E'] },
      { name:'Plus',   price:'$20/mes',   highlight:true,  features:['Más mensajes GPT-4o','Acceso anticipado a modelos','o1 y o3 disponibles','DALL·E ilimitado'] },
      { name:'Pro',    price:'$200/mes',  highlight:false, features:['GPT-4o ilimitado','o1 Pro sin límite','Máxima prioridad de cómputo'] },
    ],
    api:[
      { tier:'T1', req:'$5 pagado',     tpm:'4o: 30k / mini: 200k', rpm:'500',    note:'' },
      { tier:'T2', req:'$50 pagado',    tpm:'4o: 450k',             rpm:'5,000',  note:'' },
      { tier:'T3', req:'$100 pagado',   tpm:'4o: 800k',             rpm:'5,000',  note:'' },
      { tier:'T4', req:'$250 pagado',   tpm:'4o: 2M',               rpm:'10,000', note:'' },
      { tier:'T5', req:'$1,000 pagado', tpm:'4o: 30M',              rpm:'10,000', note:'Enterprise' },
    ],
  },
  gemini: {
    label:'Gemini — Google', color:'#4285F4', Logo: GeminiLogo,
    consumer:[
      { name:'Free',          price:'$0/mes',       highlight:false, features:['Gemini 1.5 Flash','Contexto de 1M tokens','Google Workspace básico'] },
      { name:'AI Premium',    price:'$19.99/mes',    highlight:true,  features:['Gemini Ultra','1.5 Pro con contexto 1M','NotebookLM Plus','Google One 2TB'] },
      { name:'Business/Ent.', price:'$20–30/u/mes',  highlight:false, features:['Gemini for Workspace','Datos sin entrenamiento','Controles admin avanzados'] },
    ],
    api:[
      { tier:'Free',   req:'$0',       tpm:'Flash: 1M / Pro: 32k',   rpm:'Flash:15 / Pro:2', note:'1,500 req/día Flash' },
      { tier:'Pay/go', req:'Por token', tpm:'Flash: 4M / Pro: 4M',    rpm:'Flash:2k / Pro:1k', note:'Contexto 2M' },
    ],
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt$ = (n:number|null|undefined) => n==null ? '$0.0000' : `$${n.toFixed(4)}`
const fmtK = (n:number|null|undefined) => n==null ? '0' : n>=1000000 ? `${(n/1000000).toFixed(1)}M` : n>=1000 ? `${(n/1000).toFixed(1)}k` : String(Math.round(n))
const fmtDate = (iso:string) => iso.slice(5).replace('-','/')

// ── Custom tooltip ─────────────────────────────────────────────────────────

function CostTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-white/50 mb-2 font-medium">{label}</p>
      {payload.map((p:any) => (
        <p key={p.name} style={{color:p.color}} className="flex justify-between gap-4">
          <span>{p.name}</span><span className="tabular-nums font-mono">${p.value.toFixed(4)}</span>
        </p>
      ))}
    </div>
  )
}

// ── Routing Intercept Banner ───────────────────────────────────────────────

function RoutingInterceptBanner({ byModel, totalQueries, baselineCost, actualCost }: {
  byModel: ByModel[]; totalQueries: number; baselineCost: number; actualCost: number
}) {
  if (totalQueries === 0) return null

  const convModels  = byModel.filter(m => m.modo !== 'probe')
  const diverted    = convModels.filter(m => m.model.startsWith('gpt'))
  const claudeConv  = convModels.filter(m => m.model.startsWith('claude'))
  const divertedQ   = diverted.reduce((s,m) => s+m.queries, 0)
  const divertedSav = diverted.reduce((s,m) => s+m.savings, 0)
  const claudeQ     = claudeConv.reduce((s,m) => s+m.queries, 0)
  const divertedPct = Math.round(divertedQ / Math.max(totalQueries,1) * 100)

  const sorted = [...convModels].sort((a,b) => b.queries - a.queries)

  return (
    <div className="rounded-xl border border-green-500/20 bg-[#0d1f14] p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" style={{boxShadow:'0 0 6px #4ade80'}}/>
        <span className="text-[10px] uppercase tracking-widest text-green-400/60">
          Routing intercept — queries desviadas de Claude Sonnet
        </span>
      </div>

      {/* Hero metrics */}
      <div className="flex items-end gap-8 mb-5">
        <div>
          <p className="text-5xl font-black tabular-nums leading-none text-green-400">{divertedQ}</p>
          <p className="text-sm text-white/35 mt-1">queries procesadas fuera de Claude</p>
          <p className="text-xs text-white/20">de {totalQueries} totales originadas aquí</p>
        </div>
        <div>
          <p className="text-3xl font-black tabular-nums leading-none text-green-400">{divertedPct}%</p>
          <p className="text-xs text-white/30 mt-1">del tráfico redirigido</p>
        </div>
        <div className="flex-1"/>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-green-400">{fmt$(divertedSav)}</p>
          <p className="text-xs text-white/30 mt-1">ahorro neto por routing</p>
        </div>
      </div>

      {/* Before / After visual */}
      <div className="space-y-2 mb-5">
        {/* Without Mollo */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/20 w-24 shrink-0 text-right">Sin Mollo</span>
          <div className="flex-1 h-8 rounded-lg flex items-center px-3 gap-2"
            style={{background:'#cf7c5010', border:'1px solid #cf7c5030'}}>
            <AnthropicLogo size={13}/>
            <span className="text-xs text-white/35 flex-1">Toda query → Claude Sonnet</span>
            <span className="text-xs font-mono tabular-nums text-[#cf7c50]">{fmt$(baselineCost)}</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-3">
          <span className="w-24 shrink-0"/>
          <div className="flex-1 flex justify-center">
            <span className="text-[10px] text-green-500/40">▼ Mollo intercepta y clasifica</span>
          </div>
        </div>

        {/* With Mollo — stacked bar */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/20 w-24 shrink-0 text-right">Con Mollo</span>
          <div className="flex-1 flex h-8 rounded-lg overflow-hidden gap-px">
            {sorted.map(m => {
              const color = MODEL_COLOR[m.model] ?? '#6b7280'
              const pct   = m.queries / totalQueries * 100
              return (
                <div key={m.model+m.modo}
                  className="flex items-center justify-center text-[9px] font-bold overflow-hidden"
                  style={{flex: m.queries, background: color+'22', borderTop:`2px solid ${color}`, color}}
                  title={`${MODEL_LABEL[m.model]??m.model}: ${m.queries}q · ${fmt$(m.actual_cost)}`}>
                  {pct >= 10 && `${Math.round(pct)}%`}
                </div>
              )
            })}
          </div>
          <span className="text-xs font-mono tabular-nums text-green-400">{fmt$(actualCost)}</span>
        </div>

        {/* Bar legend */}
        <div className="flex items-center gap-3">
          <span className="w-24 shrink-0"/>
          <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1 pt-1">
            {sorted.map(m => {
              const color = MODEL_COLOR[m.model] ?? '#6b7280'
              const isDiverted = m.model.startsWith('gpt')
              return (
                <span key={m.model+m.modo} className="flex items-center gap-1 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full" style={{background: color}}/>
                  <span style={{color}} className="font-medium">{MODEL_LABEL[m.model]??m.model}</span>
                  {isDiverted && <span className="text-green-500/50">✓ desviada</span>}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Per-model savings attribution */}
      <div className="border-t border-white/5 pt-4">
        <p className="text-[10px] uppercase tracking-widest text-white/20 mb-3">Ahorro atribuido por modelo</p>
        <div className="space-y-2.5">
          {sorted.map(m => {
            const color    = MODEL_COLOR[m.model] ?? '#6b7280'
            const isDiverted = m.model.startsWith('gpt')
            const savPct   = m.baseline_cost > 0 ? Math.round(m.savings/m.baseline_cost*100) : 0
            return (
              <div key={m.model+m.modo} className="flex items-center gap-3 text-xs">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background: color}}/>
                <span className="w-28 text-white/50 font-medium">{MODEL_LABEL[m.model]??m.model}</span>
                <span className="text-white/20 w-10 text-right">{m.queries}q</span>
                {isDiverted ? (
                  <>
                    <span className="text-white/15 hidden sm:inline">Claude habría cobrado</span>
                    <span className="tabular-nums font-mono text-white/25 line-through">{fmt$(m.baseline_cost)}</span>
                    <span className="text-white/15">→ pagamos</span>
                    <span className="tabular-nums font-mono" style={{color}}>{fmt$(m.actual_cost)}</span>
                    <span className="flex-1"/>
                    <span className="text-green-400 font-semibold tabular-nums">−{fmt$(m.savings)}</span>
                    <span className="text-green-500/50 w-10 text-right">({savPct}%)</span>
                  </>
                ) : (
                  <>
                    <span className="text-white/15 italic text-[10px] flex-1">query compleja — modelo correcto para este caso</span>
                    <span className="tabular-nums font-mono text-white/25">{fmt$(m.actual_cost)}</span>
                    <span className="text-white/15 w-10 text-right">—</span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer explanation */}
      <p className="mt-4 pt-3 border-t border-white/5 text-[10px] text-white/20 leading-relaxed">
        Las queries se originan en Claude Code, Telegram o la API — pero Mollo Brain las intercepta,
        clasifica su complejidad y las redirige al modelo más económico capaz de resolverlas.
        Solo el <strong className="text-white/35">{Math.round(claudeQ/Math.max(totalQueries,1)*100)}% requirió Claude Sonnet</strong> (análisis estratégico profundo).
        El resto lo resolvió OpenAI a una fracción del costo.
      </p>
    </div>
  )
}

// ── Mollo Orchestrator Tree ────────────────────────────────────────────────

const MODO_META = [
  { key:'simple',   label:'Simple',   sub:'GPT-4o-mini', color:'#10b981', desc:'Consultas directas y rápidas' },
  { key:'medio',    label:'Medio',    sub:'GPT-4o',      color:'#3b82f6', desc:'Análisis con contexto' },
  { key:'agente',   label:'Agente',   sub:'GPT-4o+tools',color:'#8b5cf6', desc:'Herramientas externas' },
  { key:'complejo', label:'Complejo', sub:'Claude Sonnet',color:'#cf7c50', desc:'Razonamiento profundo' },
]

function MolloOrchestrator({ byModel, totalQueries }: { byModel:ByModel[]; totalQueries:number }) {
  if (totalQueries === 0) return null

  const openaiModels    = byModel.filter(m => m.model.startsWith('gpt'))
  const anthropicModels = byModel.filter(m => m.model.startsWith('claude'))
  const openaiQ    = openaiModels.reduce((s,m) => s+m.queries, 0)
  const anthropicQ = anthropicModels.reduce((s,m) => s+m.queries, 0)
  const openaiPct    = Math.round(openaiQ    / totalQueries * 100)
  const anthropicPct = Math.round(anthropicQ / totalQueries * 100)

  const modoMap: Record<string,number> = {}
  for (const m of byModel) modoMap[m.modo] = (modoMap[m.modo]??0) + m.queries

  return (
    <div className="rounded-xl border border-white/8 bg-[#1a1a1a] p-6 mb-6">
      <h2 className="text-xs uppercase tracking-widest text-white/30 mb-6">
        Mollo como orquestador — routing inteligente de sub-IAs
      </h2>

      {/* Root node */}
      <div className="flex justify-center mb-4">
        <div className="rounded-2xl border-2 border-white/20 bg-[#252525] px-8 py-4 flex items-center gap-4 shadow-lg">
          <img
            src="/sinergy/logo-sinergy.png"
            alt="Mollo"
            style={{width:44,height:44,borderRadius:10,objectFit:'cover',objectPosition:'center 20%',border:'1.5px solid rgba(255,255,255,0.18)',flexShrink:0}}
          />
          <div>
            <p className="font-bold text-white text-base">Mollo</p>
            <p className="text-xs text-white/40">Orquestador · {totalQueries} queries totales</p>
          </div>
        </div>
      </div>

      {/* Connector */}
      <div className="flex justify-center mb-0">
        <div className="w-px h-5 bg-white/15"/>
      </div>
      <div className="flex justify-center mb-0">
        <div className="w-1/2 h-px border-t border-white/10"/>
      </div>
      <div className="flex justify-between px-[25%] mb-0">
        <div className="w-px h-4 bg-white/10"/>
        <div className="w-px h-4 bg-white/10"/>
      </div>

      {/* Provider children */}
      <div className="grid grid-cols-2 gap-4 mb-5">

        {/* OpenAI */}
        <div className="rounded-xl border p-4" style={{borderColor:'#10b98130', background:'#10b98108'}}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'#10b98120'}}>
                <OpenAILogo size={18}/>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">OpenAI</p>
                <p className="text-[11px] text-white/30">{openaiQ} queries</p>
              </div>
            </div>
            <div className="text-2xl font-black tabular-nums" style={{color:'#10b981'}}>{openaiPct}%</div>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full mb-3 overflow-hidden">
            <div className="h-full rounded-full" style={{width:`${openaiPct}%`,background:'#10b981'}}/>
          </div>
          <div className="space-y-1.5">
            {openaiModels.map(m => {
              const pct = Math.round(m.queries/totalQueries*100)
              const color = MODEL_COLOR[m.model]??'#10b981'
              return (
                <div key={m.model+m.modo} className="flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:color}}/>
                  <span className="flex-1 text-white/50">{MODEL_LABEL[m.model]??m.model}</span>
                  <span className="text-white/25 capitalize">{m.modo}</span>
                  <span className="font-medium tabular-nums" style={{color}}>{pct}%</span>
                  <span className="text-white/20 w-6 text-right">{m.queries}q</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Anthropic */}
        <div className="rounded-xl border p-4" style={{borderColor:'#cf7c5030', background:'#cf7c5008'}}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'#cf7c5020'}}>
                <AnthropicLogo size={18}/>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Anthropic</p>
                <p className="text-[11px] text-white/30">{anthropicQ} queries</p>
              </div>
            </div>
            <div className="text-2xl font-black tabular-nums" style={{color:'#cf7c50'}}>{anthropicPct}%</div>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full mb-3 overflow-hidden">
            <div className="h-full rounded-full" style={{width:`${anthropicPct}%`,background:'#cf7c50'}}/>
          </div>
          {anthropicModels.length > 0 ? (
            <div className="space-y-1.5">
              {anthropicModels.map(m => {
                const pct = Math.round(m.queries/totalQueries*100)
                const color = MODEL_COLOR[m.model]??'#cf7c50'
                return (
                  <div key={m.model+m.modo} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:color}}/>
                    <span className="flex-1 text-white/50">{MODEL_LABEL[m.model]??m.model}</span>
                    <span className="text-white/25 capitalize">{m.modo}</span>
                    <span className="font-medium tabular-nums" style={{color}}>{pct}%</span>
                    <span className="text-white/20 w-6 text-right">{m.queries}q</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-white/20 italic">Sin queries complejas aún — el costo sería {fmtK(0)} veces mayor</p>
          )}
        </div>
      </div>

      {/* Routing mode distribution */}
      <div className="border-t border-white/5 pt-5">
        <p className="text-[10px] uppercase tracking-widest text-white/25 mb-3">Distribución de complejidad detectada automáticamente</p>
        <div className="grid grid-cols-4 gap-3">
          {MODO_META.map(modo => {
            const q   = modoMap[modo.key] ?? 0
            const pct = totalQueries > 0 ? Math.round(q/totalQueries*100) : 0
            return (
              <div key={modo.key} className="rounded-lg border border-white/5 bg-[#232323] p-3">
                <div className="flex items-end justify-between mb-1">
                  <span className="text-xs font-semibold text-white/70">{modo.label}</span>
                  <span className="text-lg font-black tabular-nums" style={{color:modo.color}}>{pct}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full mb-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${pct}%`,background:modo.color}}/>
                </div>
                <p className="text-[10px] text-white/30">{modo.sub}</p>
                <p className="text-[10px] text-white/15">{q} queries</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Metric card ────────────────────────────────────────────────────────────

function MetricCard({ icon:Icon, label, value, sub, color='text-white' }:
  { icon:any; label:string; value:string; sub?:string; color?:string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#1a1a1a] p-5 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-white/30"/>
        <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
      {sub && <span className="text-xs text-white/30">{sub}</span>}
    </div>
  )
}

// ── Provider card ──────────────────────────────────────────────────────────

function ProviderCard({ data }: { data: ByProvider }) {
  const meta = PROVIDER_META[data.provider] ?? PROVIDER_META['Otro']
  const { Logo } = meta
  const pct = data.baseline_cost > 0
    ? Math.round((data.savings / data.baseline_cost) * 100) : 0
  const totalTok = (data.input_tokens??0) + (data.output_tokens??0)

  return (
    <div className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ borderColor: `${meta.color}30`, background: meta.bg }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${meta.color}20` }}>
            <Logo size={20} />
          </div>
          <span className="font-semibold text-white">{data.provider}</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background:`${meta.color}20`, color:meta.color }}>
          {pct}% ahorro
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-lg font-bold tabular-nums text-white">{data.queries}</p>
          <p className="text-[10px] text-white/30 uppercase">queries</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums text-white">{fmtK(totalTok)}</p>
          <p className="text-[10px] text-white/30 uppercase">tokens</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums" style={{color:meta.color}}>{fmt$(data.actual_cost)}</p>
          <p className="text-[10px] text-white/30 uppercase">costo real</p>
        </div>
      </div>
      <div className="flex justify-between text-xs border-t border-white/5 pt-2">
        <span className="text-white/30">Baseline: {fmt$(data.baseline_cost)}</span>
        <span className="text-green-400 font-medium">Ahorro: {fmt$(data.savings)}</span>
      </div>
      {data.cache_tokens > 0 && (
        <div className="text-xs text-purple-400">
          ⚡ {fmtK(data.cache_tokens)} tokens desde caché
        </div>
      )}
    </div>
  )
}

// ── Topic card ─────────────────────────────────────────────────────────────

function TopicCard({ topic, modelData }: { topic:ByTopic; modelData:TopicByModel[] }) {
  const meta = TOPIC_META[topic.topic] ?? TOPIC_META['general']
  const totalTok = (topic.input_tokens??0) + (topic.output_tokens??0)
  const pct = topic.baseline_cost > 0
    ? Math.round((topic.savings / topic.baseline_cost) * 100) : 0

  const models = modelData.filter(m => m.topic === topic.topic)
  const pieData = models.map(m => ({
    name: MODEL_LABEL[m.model] ?? m.model,
    value: m.queries,
    color: MODEL_COLOR[m.model] ?? '#6b7280',
  }))

  return (
    <div className="rounded-xl border border-white/8 bg-[#1a1a1a] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.icon}</span>
          <div>
            <p className="font-medium text-white text-sm">{meta.label}</p>
            <p className="text-xs text-white/30">{topic.queries} queries</p>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background:`${meta.color}20`, color:meta.color }}>
          {pct}% ahorro
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Mini pie chart */}
        {pieData.length > 0 && (
          <PieChart width={64} height={64}>
            <Pie data={pieData} cx={28} cy={28} innerRadius={18} outerRadius={30}
              dataKey="value" strokeWidth={0}>
              {pieData.map((e,i) => <Cell key={i} fill={e.color}/>)}
            </Pie>
          </PieChart>
        )}

        {/* Stats */}
        <div className="flex-1 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-white/40">Tokens</span>
            <span className="text-white tabular-nums font-mono">{fmtK(totalTok)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Costo real</span>
            <span className="tabular-nums font-mono" style={{color:meta.color}}>{fmt$(topic.actual_cost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Ahorro</span>
            <span className="text-green-400 tabular-nums font-mono">{fmt$(topic.savings)}</span>
          </div>
          {(topic.cache_tokens??0) > 0 && (
            <div className="flex justify-between">
              <span className="text-white/40">Caché</span>
              <span className="text-purple-400 tabular-nums font-mono">{fmtK(topic.cache_tokens)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Model breakdown */}
      {models.length > 0 && (
        <div className="border-t border-white/5 pt-2 space-y-1">
          {models.map(m => {
            const color = MODEL_COLOR[m.model] ?? '#6b7280'
            const pctModel = topic.queries > 0 ? Math.round(m.queries/topic.queries*100) : 0
            return (
              <div key={m.model} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{background:color}}/>
                <span className="text-white/50 flex-1 truncate">{MODEL_LABEL[m.model]??m.model}</span>
                <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${pctModel}%`,background:color}}/>
                </div>
                <span className="text-white/30 w-8 text-right">{pctModel}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Rate Limit Gauge ───────────────────────────────────────────────────────

function RateLimitGauge({ label, used, limit, reset, color }: {
  label:string; used:number; limit:number; reset:string; color:string
}) {
  const pct   = limit > 0 ? Math.round((used / limit) * 100) : 0
  const warn  = pct >= 80
  const crit  = pct >= 95
  const stateColor = crit ? '#ef4444' : warn ? '#f59e0b' : color

  return (
    <div className="rounded-xl border border-white/8 bg-[#1e1e1e] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50 font-medium">{label}</span>
        {crit  ? <AlertTriangle size={13} className="text-red-400"/>
        : warn  ? <AlertTriangle size={13} className="text-amber-400"/>
        : <CheckCircle size={13} className="text-green-500 opacity-50"/>}
      </div>
      {/* Arc-style gauge using stacked bars */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-2">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{width:`${pct}%`, background: stateColor}}/>
      </div>
      <div className="flex justify-between text-[10px]">
        <span className="tabular-nums font-mono" style={{color: stateColor}}>
          {fmtK(limit - used)} restantes
        </span>
        <span className="text-white/20 tabular-nums">{fmtK(limit)} límite/min</span>
      </div>
      {pct > 0 && (
        <div className="text-[10px] text-white/20 mt-0.5">
          usado: {fmtK(used)} · reset: {reset || '~1 min'}
        </div>
      )}
    </div>
  )
}

// ── Budget Alert Card ──────────────────────────────────────────────────────

function BudgetAlert({ spent, budget, label, color }: {
  spent:number; budget:number; label:string; color:string
}) {
  const pct  = budget > 0 ? Math.min(100, Math.round(spent / budget * 100)) : 0
  const warn = pct >= 80
  const crit = pct >= 95
  const barColor = crit ? '#ef4444' : warn ? '#f59e0b' : '#10b981'

  return (
    <div className={`rounded-xl border p-4 ${crit ? 'border-red-500/30 bg-red-500/5' : warn ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/8 bg-[#1e1e1e]'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">{label}</span>
        {crit ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 flex items-center gap-1"><AlertTriangle size={10}/> ALERTA</span>
        : warn ? <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1"><Bell size={10}/> Precaución</span>
        : <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">Normal</span>}
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-black tabular-nums" style={{color: barColor}}>{pct}%</span>
        <span className="text-xs text-white/30 mb-1">{fmt$(spent)} / {fmt$(budget)}</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, background: barColor}}/>
      </div>
      <div className="flex justify-between text-[10px] mt-1.5">
        <span className="text-white/30">Restante: {fmt$(budget - spent)}</span>
        <span className="text-white/20">Presupuesto mensual</span>
      </div>
    </div>
  )
}

// ── Tier Badge ─────────────────────────────────────────────────────────────

function tierLabel(reqLimit: number, tokLimit: number, provider: 'anthropic' | 'openai'): string {
  if (provider === 'anthropic') {
    if (reqLimit >= 4000) return 'T4'
    if (reqLimit >= 2000) return 'T3'
    if (reqLimit >= 1000) return 'T2'
    return 'T1'
  }
  // OpenAI
  if (reqLimit >= 10000) return 'T2+'
  if (reqLimit >= 3500)  return 'T2'
  return 'T1'
}

// ── Main dashboard ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const [tab, setTab] = useState<'resumen'|'modelos'|'temas'|'limites'|'suscripciones'|'topologia'>('resumen')
  const [summary,      setSummary]      = useState<CostSummary|null>(null)
  const [providers,    setProviders]    = useState<ByProvider[]>([])
  const [topics,       setTopics]       = useState<ByTopic[]>([])
  const [topicModels,  setTopicModels]  = useState<TopicByModel[]>([])
  const [recent,       setRecent]       = useState<RecentRow[]>([])
  const [limitsData,   setLimitsData]   = useState<LimitsData|null>(null)
  const [limitsLoading, setLimitsLoading] = useState(false)
  const [budgetAnthropic, setBudgetAnthropic] = useState<number>(50)
  const [budgetOpenAI,    setBudgetOpenAI]    = useState<number>(50)
  const [loading,      setLoading]      = useState(true)
  const [refreshing,   setRefreshing]   = useState(false)

  const loadData = useCallback(async (isRefresh=false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const [s,p,t,tm,r] = await Promise.all([
        fetch('/sinergy/api/costs?endpoint=summary').then(r=>r.json()),
        fetch('/sinergy/api/costs?endpoint=by_provider').then(r=>r.json()),
        fetch('/sinergy/api/costs?endpoint=by_topic').then(r=>r.json()),
        fetch('/sinergy/api/costs?endpoint=topic_by_model').then(r=>r.json()),
        fetch('/sinergy/api/costs?endpoint=recent&limit=50').then(r=>r.json()),
      ])
      setSummary(s)
      setProviders(Array.isArray(p) ? p : [])
      setTopics(Array.isArray(t) ? t : [])
      setTopicModels(Array.isArray(tm) ? tm : [])
      setRecent(Array.isArray(r) ? r : [])
    } catch { /* silent */ }
    setLoading(false)
    setRefreshing(false)
  }, [])

  const loadLimits = useCallback(async () => {
    setLimitsLoading(true)
    try {
      const d = await fetch('/sinergy/api/limits?mode=probe').then(r=>r.json())
      setLimitsData(d)
    } catch { /* silent */ }
    setLimitsLoading(false)
  }, [])

  useEffect(()=>{ loadData() },[loadData])
  useEffect(()=>{ if(tab==='limites') loadLimits() },[tab, loadLimits])

  const lt          = summary?.lifetime
  const totalTokens = (lt?.input_tokens??0) + (lt?.output_tokens??0)
  const savingsPct  = lt?.savings_pct ?? 0

  // chart data
  const modelChart = (summary?.by_model??[]).map(r=>({
    name: MODEL_LABEL[r.model]??r.model,
    real: +(r.actual_cost??0).toFixed(6),
    baseline: +(r.baseline_cost??0).toFixed(6),
    queries: r.queries,
    tokens: (r.input_tokens??0)+(r.output_tokens??0),
    savings: +(r.savings??0).toFixed(6),
    color: MODEL_COLOR[r.model]??'#6b7280',
  }))

  const dailyChart = [...(summary?.last_7_days??[])].reverse().map(r=>({
    day: fmtDate(r.day),
    real: +(r.actual_cost??0).toFixed(6),
    baseline: +(r.baseline_cost??0).toFixed(6),
    queries: r.queries,
  }))

  const tabs = [
    { id:'resumen',       label:'Resumen'        },
    { id:'modelos',       label:'Por Modelo'     },
    { id:'temas',         label:'Por Tema'       },
    { id:'limites',       label:'Límites & Alertas' },
    { id:'suscripciones', label:'Suscripciones'  },
    { id:'topologia',     label:'⬡ Topología'    },
  ] as const

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Header */}
      <div className="border-b border-white/8 bg-[#171717] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/mollo/" className="text-white/30 hover:text-white transition-colors p-1">
              <ChevronLeft size={18}/>
            </a>
            <div className="flex items-center gap-2.5">
              <img
                src="/sinergy/logo-sinergy.png"
                alt="Mollo"
                style={{width:30,height:30,borderRadius:'50%',objectFit:'cover',objectPosition:'center 20%',border:'1.5px solid rgba(255,255,255,0.15)'}}
              />
              <span className="font-semibold text-sm">Mollo Analytics</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex bg-[#2a2a2a] rounded-lg p-0.5 gap-0.5">
              {tabs.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    tab===t.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                  }`}>
                  {t.label}
                </button>
              ))}
            </nav>
            {tab!=='suscripciones' && tab!=='topologia' && (
              <button
                onClick={()=> tab==='limites' ? loadLimits() : loadData(true)}
                className="p-1.5 text-white/30 hover:text-white transition-colors">
                <RefreshCw size={14} className={(refreshing||limitsLoading)?'animate-spin':''}/>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── RESUMEN ──────────────────────────────────────────────────── */}
        {tab==='resumen' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center h-64 text-white/20 text-sm">Cargando…</div>
            ) : (
              <>
                {/* Metric cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <MetricCard icon={Activity} label="Queries totales" value={String(lt?.queries??0)} sub={`${fmtK(totalTokens)} tokens reales`}/>
                  <MetricCard icon={DollarSign} label="Costo real" value={fmt$(lt?.actual_cost)} sub={`Baseline: ${fmt$(lt?.baseline_cost)}`}/>
                  <MetricCard icon={TrendingDown} label="Ahorro total" value={fmt$(lt?.savings)} sub="vs todo-Claude Sonnet" color="text-green-400"/>
                  <MetricCard icon={Zap} label="Optimización" value={`${savingsPct}%`} sub={`${fmtK(lt?.cache_tokens)} tokens desde caché`} color="text-purple-400"/>
                </div>

                {/* Savings bar */}
                {(lt?.baseline_cost??0)>0 && (
                  <div className="rounded-xl border border-white/8 bg-[#1a1a1a] p-5 mb-6">
                    <div className="flex justify-between mb-2 text-xs">
                      <span className="text-white/50">Costo real vs costo sin optimización (todo Claude Sonnet)</span>
                      <span className="text-green-400 font-medium">{savingsPct}% más eficiente</span>
                    </div>
                    <div className="relative h-5 bg-white/5 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-white/5 rounded-full"/>
                      <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-600 to-emerald-400 flex items-center justify-end pr-2 transition-all"
                        style={{width:`${100-savingsPct}%`}}>
                        <span className="text-[10px] font-bold text-black">{fmt$(lt?.actual_cost)}</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-end pr-3">
                        <span className="text-[10px] text-white/25">{fmt$(lt?.baseline_cost)}</span>
                      </div>
                    </div>
                    <div className="flex gap-5 mt-2 text-[10px] text-white/30">
                      <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1"/>Costo real Mollo</span>
                      <span><span className="inline-block w-2 h-2 rounded-full bg-white/15 mr-1"/>Sin optimización</span>
                    </div>
                  </div>
                )}

                {/* Routing Intercept Banner */}
                {(lt?.queries??0) > 0 && (
                  <RoutingInterceptBanner
                    byModel={summary?.by_model ?? []}
                    totalQueries={lt?.queries ?? 0}
                    baselineCost={lt?.baseline_cost ?? 0}
                    actualCost={lt?.actual_cost ?? 0}
                  />
                )}

                {/* Mollo orchestrator tree */}
                {(lt?.queries??0) > 0 && (
                  <MolloOrchestrator
                    byModel={summary?.by_model ?? []}
                    totalQueries={lt?.queries ?? 0}
                  />
                )}

                {/* Provider cards con logos */}
                {providers.length > 0 && (
                  <>
                    <h2 className="text-xs uppercase tracking-widest text-white/30 mb-3">Costo y ahorro por proveedor</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {providers.map(p=><ProviderCard key={p.provider} data={p}/>)}
                    </div>
                  </>
                )}

                {/* Daily chart */}
                <div className="rounded-xl border border-white/8 bg-[#1a1a1a] p-5">
                  <h2 className="text-sm font-medium text-white/60 mb-4">Tendencia — últimos 7 días</h2>
                  {dailyChart.length===0
                    ? <div className="text-white/20 text-sm py-10 text-center">Sin datos</div>
                    : (
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={dailyChart} margin={{left:0,right:10,top:5}}>
                          <defs>
                            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4b5563" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#4b5563" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" tick={{fill:'#555',fontSize:11}}/>
                          <YAxis tick={{fill:'#555',fontSize:10}} tickFormatter={v=>`$${v.toFixed(3)}`} width={55}/>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a"/>
                          <Tooltip content={<CostTooltip/>}/>
                          <Legend wrapperStyle={{fontSize:11,color:'#777'}}/>
                          <Area type="monotone" dataKey="baseline" name="Sin optimización" stroke="#4b5563" fill="url(#g1)" strokeWidth={1.5}/>
                          <Area type="monotone" dataKey="real" name="Costo real" stroke="#10b981" fill="url(#g2)" strokeWidth={2}/>
                        </AreaChart>
                      </ResponsiveContainer>
                    )
                  }
                </div>
              </>
            )}
          </>
        )}

        {/* ── POR MODELO ───────────────────────────────────────────────── */}
        {tab==='modelos' && (
          <>
            {loading ? <div className="text-white/20 text-sm py-20 text-center">Cargando…</div> : (
              <>
                {/* Model breakdown by provider */}
                {(['OpenAI','Anthropic','Google'] as const).map(provName => {
                  const provMeta = PROVIDER_META[provName]
                  const { Logo } = provMeta
                  const provModels = modelChart.filter(m =>
                    provName==='OpenAI'    ? m.name.includes('GPT')    :
                    provName==='Anthropic' ? m.name.includes('Claude') :
                    m.name.includes('Gemini')
                  )
                  if (!provModels.length) return null
                  return (
                    <div key={provName} className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{background:`${provMeta.color}20`}}>
                          <Logo size={18}/>
                        </div>
                        <h2 className="font-semibold" style={{color:provMeta.color}}>{provName}</h2>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-[#1a1a1a] p-5">
                        <ResponsiveContainer width="100%" height={provModels.length*60+40}>
                          <BarChart data={provModels} layout="vertical" margin={{left:90,right:10}}>
                            <XAxis type="number" tick={{fill:'#555',fontSize:10}} tickFormatter={v=>`$${v.toFixed(4)}`}/>
                            <YAxis type="category" dataKey="name" tick={{fill:'#999',fontSize:11}} width={90}/>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222"/>
                            <Tooltip content={<CostTooltip/>}/>
                            <Bar dataKey="real" name="Real" radius={[0,4,4,0]}>
                              {provModels.map((e,i)=><Cell key={i} fill={e.color}/>)}
                            </Bar>
                            <Bar dataKey="baseline" name="Baseline" fill="#2d2d2d" radius={[0,4,4,0]}/>
                          </BarChart>
                        </ResponsiveContainer>

                        <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
                          {provModels.map((m,i)=>(
                            <div key={i} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{background:m.color}}/>
                                <span className="text-white/70 font-medium">{m.name}</span>
                                <span className="text-white/25">{m.queries} queries · {fmtK(m.tokens)} tokens</span>
                              </div>
                              <div className="flex gap-4">
                                <span style={{color:m.color}} className="tabular-nums">{fmt$(m.real)}</span>
                                <span className="text-white/25 tabular-nums">vs {fmt$(m.baseline)}</span>
                                <span className="text-green-400 tabular-nums">-{fmt$(m.savings)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Recent queries table */}
                {recent.length>0 && (
                  <div className="rounded-xl border border-white/8 bg-[#1a1a1a] p-5">
                    <h2 className="text-sm font-medium text-white/60 mb-4">Queries recientes</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-white/25 border-b border-white/8">
                            {['Hora','Modelo','Modo','Tema','Input','Output','Caché','Real','Ahorro','Query'].map(h=>(
                              <th key={h} className="text-left pb-2 font-medium px-1">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {recent.slice(0,30).map(r=>{
                            const mc = MODEL_COLOR[r.model]??'#999'
                            const tm = TOPIC_META[r.topic??'general']??TOPIC_META['general']
                            return (
                              <tr key={r.id} className="border-b border-white/5 hover:bg-white/2">
                                <td className="py-1.5 px-1 text-white/25">{r.ts.slice(11,19)}</td>
                                <td className="py-1.5 px-1 font-medium" style={{color:mc}}>{MODEL_LABEL[r.model]??r.model}</td>
                                <td className="py-1.5 px-1 text-white/40">{r.modo}</td>
                                <td className="py-1.5 px-1">
                                  <span className="flex items-center gap-1">
                                    <span>{tm.icon}</span>
                                    <span style={{color:tm.color}} className="text-[10px]">{tm.label}</span>
                                  </span>
                                </td>
                                <td className="py-1.5 px-1 text-right text-white/40 tabular-nums font-mono">{fmtK(r.input_tokens)}</td>
                                <td className="py-1.5 px-1 text-right text-white/40 tabular-nums font-mono">{fmtK(r.output_tokens)}</td>
                                <td className="py-1.5 px-1 text-right tabular-nums font-mono">
                                  {r.cache_read_tokens>0
                                    ? <span className="text-purple-400">{fmtK(r.cache_read_tokens)}</span>
                                    : <span className="text-white/15">—</span>}
                                </td>
                                <td className="py-1.5 px-1 text-right text-white/60 tabular-nums font-mono">{fmt$(r.actual_cost)}</td>
                                <td className="py-1.5 px-1 text-right text-green-400 font-medium tabular-nums font-mono">{fmt$(r.savings)}</td>
                                <td className="py-1.5 px-1 text-white/30 max-w-[180px] truncate">{r.query_preview}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── POR TEMA ─────────────────────────────────────────────────── */}
        {tab==='temas' && (
          <>
            {loading ? <div className="text-white/20 text-sm py-20 text-center">Cargando…</div> : (
              <>
                <p className="text-white/40 text-sm mb-6">
                  Consumo de tokens y costo agrupado por tema de conversación detectado automáticamente.
                  El modelo usado para cada tema determina el costo real vs el costo baseline (todo Claude Sonnet).
                </p>

                {topics.length===0 ? (
                  <div className="rounded-xl border border-white/8 bg-[#1a1a1a] p-12 text-center">
                    <span className="text-4xl mb-4 block">📊</span>
                    <p className="text-white/30 text-sm">Sin datos por tema aún.</p>
                    <p className="text-white/20 text-xs mt-1">Los temas se detectan automáticamente en cada conversación.</p>
                  </div>
                ) : (
                  <>
                    {/* Summary bar — savings by topic */}
                    <div className="rounded-xl border border-white/8 bg-[#1a1a1a] p-5 mb-6">
                      <h2 className="text-xs uppercase tracking-widest text-white/30 mb-4">Ahorro acumulado por tema</h2>
                      <div className="space-y-2">
                        {topics.map(t=>{
                          const meta = TOPIC_META[t.topic]??TOPIC_META['general']
                          const pct = t.baseline_cost>0 ? (t.savings/t.baseline_cost*100) : 0
                          const barW = t.baseline_cost>0
                            ? Math.min(100, (1-(t.actual_cost/t.baseline_cost))*100) : 0
                          return (
                            <div key={t.topic} className="flex items-center gap-3 text-xs">
                              <span className="w-5 text-center">{meta.icon}</span>
                              <span className="w-28 text-white/50 truncate">{meta.label}</span>
                              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all"
                                  style={{width:`${barW}%`, background:meta.color}}/>
                              </div>
                              <span className="w-10 text-right tabular-nums font-mono" style={{color:meta.color}}>
                                {pct.toFixed(0)}%
                              </span>
                              <span className="w-20 text-right text-green-400 tabular-nums font-mono">{fmt$(t.savings)}</span>
                              <span className="w-12 text-right text-white/25 tabular-nums">{t.queries}q</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Topic cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {topics.map(t=>(
                        <TopicCard key={t.topic} topic={t} modelData={topicModels}/>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ── LÍMITES & ALERTAS ────────────────────────────────────────── */}
        {tab==='limites' && (
          <div className="space-y-6">
            {limitsLoading ? (
              <div className="flex items-center justify-center h-64 text-white/20 text-sm gap-2">
                <RefreshCw size={14} className="animate-spin"/> Sondeando APIs…
              </div>
            ) : !limitsData ? (
              <div className="text-white/20 text-sm py-20 text-center">Sin datos</div>
            ) : (
              <>
                {/* Context banner */}
                <div className="rounded-xl border border-white/8 bg-[#1a1a1a] p-4 flex gap-3">
                  <Info size={14} className="text-white/25 mt-0.5 shrink-0"/>
                  <div className="text-xs text-white/40 leading-relaxed">
                    Anthropic y OpenAI son <strong className="text-white/60">pay-per-token</strong> — no existe un banco de tokens de suscripción.
                    Los límites abajo son <strong className="text-white/60">ventanas de rate limit por minuto</strong> que se resetean automáticamente.
                    El <strong className="text-white/60">presupuesto mensual</strong> lo configuras tú — Mollo te alerta cuando te acercas.
                    {limitsData.cached && <span className="text-white/20 ml-2">(caché {limitsData.cache_age_s}s)</span>}
                  </div>
                </div>

                {/* Budget alerts */}
                <div>
                  <h2 className="text-xs uppercase tracking-widest text-white/30 mb-3 flex items-center gap-2">
                    <Bell size={12}/> Presupuesto mensual y alertas
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {(() => {
                      const anthUsage = limitsData.usage.by_provider.find(p=>p.provider==='Anthropic')
                      const oaiUsage  = limitsData.usage.by_provider.find(p=>p.provider==='OpenAI')
                      const anthSpent = anthUsage?.actual_cost ?? 0
                      const oaiSpent  = oaiUsage?.actual_cost  ?? 0
                      return (
                        <>
                          <div>
                            <BudgetAlert spent={anthSpent} budget={budgetAnthropic}
                              label="Anthropic — Claude" color="#cf7c50"/>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] text-white/30">Presupuesto:</span>
                              <input type="range" min={5} max={500} step={5} value={budgetAnthropic}
                                onChange={e=>setBudgetAnthropic(+e.target.value)}
                                className="flex-1 accent-amber-500 h-1"/>
                              <span className="text-[11px] text-white/50 w-14 text-right font-mono">${budgetAnthropic}/mes</span>
                            </div>
                          </div>
                          <div>
                            <BudgetAlert spent={oaiSpent} budget={budgetOpenAI}
                              label="OpenAI — GPT" color="#10b981"/>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] text-white/30">Presupuesto:</span>
                              <input type="range" min={5} max={500} step={5} value={budgetOpenAI}
                                onChange={e=>setBudgetOpenAI(+e.target.value)}
                                className="flex-1 accent-green-500 h-1"/>
                              <span className="text-[11px] text-white/50 w-14 text-right font-mono">${budgetOpenAI}/mes</span>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Rate limits - Anthropic */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'#cf7c5020'}}>
                      <AnthropicLogo size={16}/>
                    </div>
                    <h2 className="text-xs uppercase tracking-widest text-white/30">
                      Anthropic — Rate limits por minuto
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">
                      {tierLabel(limitsData.anthropic.headers.req_limit ?? 0, limitsData.anthropic.headers.tokens_limit ?? 0, 'anthropic')}
                    </span>
                  </div>
                  {limitsData.anthropic.error ? (
                    <div className="text-red-400 text-xs p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                      Error: {limitsData.anthropic.error}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <RateLimitGauge
                        label="Input tokens"
                        used={limitsData.anthropic.headers.input_limit - limitsData.anthropic.headers.input_remaining}
                        limit={limitsData.anthropic.headers.input_limit}
                        reset={limitsData.anthropic.headers.input_reset?.slice(11,19) ?? ''}
                        color="#cf7c50"
                      />
                      <RateLimitGauge
                        label="Output tokens"
                        used={limitsData.anthropic.headers.output_limit - limitsData.anthropic.headers.output_remaining}
                        limit={limitsData.anthropic.headers.output_limit}
                        reset={limitsData.anthropic.headers.output_reset?.slice(11,19) ?? ''}
                        color="#cf7c50"
                      />
                      <RateLimitGauge
                        label="Tokens totales"
                        used={limitsData.anthropic.headers.tokens_limit - limitsData.anthropic.headers.tokens_remaining}
                        limit={limitsData.anthropic.headers.tokens_limit}
                        reset={limitsData.anthropic.headers.tokens_reset?.slice(11,19) ?? ''}
                        color="#cf7c50"
                      />
                      <RateLimitGauge
                        label="Requests"
                        used={limitsData.anthropic.headers.req_limit - limitsData.anthropic.headers.req_remaining}
                        limit={limitsData.anthropic.headers.req_limit}
                        reset={limitsData.anthropic.headers.req_reset?.slice(11,19) ?? ''}
                        color="#cf7c50"
                      />
                    </div>
                  )}
                </div>

                {/* Rate limits - OpenAI */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'#10b98120'}}>
                      <OpenAILogo size={16}/>
                    </div>
                    <h2 className="text-xs uppercase tracking-widest text-white/30">
                      OpenAI — Rate limits por minuto
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium">
                      {tierLabel(limitsData.openai.headers.req_limit ?? 0, limitsData.openai.headers.tokens_limit ?? 0, 'openai')}
                    </span>
                  </div>
                  {limitsData.openai.error ? (
                    <div className="text-red-400 text-xs p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                      Error: {limitsData.openai.error}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                      <RateLimitGauge
                        label="Tokens"
                        used={limitsData.openai.headers.tokens_limit - limitsData.openai.headers.tokens_remaining}
                        limit={limitsData.openai.headers.tokens_limit}
                        reset={limitsData.openai.headers.tokens_reset ?? ''}
                        color="#10b981"
                      />
                      <RateLimitGauge
                        label="Requests"
                        used={limitsData.openai.headers.req_limit - limitsData.openai.headers.req_remaining}
                        limit={limitsData.openai.headers.req_limit}
                        reset={limitsData.openai.headers.req_reset ?? ''}
                        color="#10b981"
                      />
                    </div>
                  )}
                </div>

                {/* Acumulado histórico desde Mollo */}
                <div>
                  <h2 className="text-xs uppercase tracking-widest text-white/30 mb-3">
                    Consumo acumulado rastreado por Mollo
                  </h2>
                  <div className="rounded-xl border border-white/8 bg-[#1a1a1a] divide-y divide-white/5">
                    {limitsData.usage.by_provider.map(p => {
                      const meta = PROVIDER_META[p.provider] ?? PROVIDER_META['Otro']
                      const { Logo } = meta
                      const totalTok = (p.input_tokens??0)+(p.output_tokens??0)+(p.cache_tokens??0)
                      const firstDate = p.first_seen ? p.first_seen.slice(0,10) : '—'
                      return (
                        <div key={p.provider} className="p-4 flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{background:`${meta.color}20`}}>
                            <Logo size={18}/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{p.provider}</p>
                            <p className="text-[10px] text-white/25">desde {firstDate}</p>
                          </div>
                          <div className="grid grid-cols-4 gap-6 text-right">
                            <div>
                              <p className="text-sm font-bold tabular-nums text-white">{p.queries}</p>
                              <p className="text-[10px] text-white/25">queries</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold tabular-nums text-white">{fmtK(totalTok)}</p>
                              <p className="text-[10px] text-white/25">tokens</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold tabular-nums" style={{color:meta.color}}>{fmt$(p.actual_cost)}</p>
                              <p className="text-[10px] text-white/25">gastado</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold tabular-nums text-white/40">{fmtK(p.input_tokens)}/{fmtK(p.output_tokens)}</p>
                              <p className="text-[10px] text-white/25">in/out</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {limitsData.usage.by_provider.length === 0 && (
                      <p className="p-6 text-xs text-white/20 text-center">Sin datos acumulados aún</p>
                    )}
                  </div>
                </div>

                {/* Monthly breakdown */}
                {limitsData.usage.by_month.length > 0 && (
                  <div>
                    <h2 className="text-xs uppercase tracking-widest text-white/30 mb-3">Historial mensual</h2>
                    <div className="rounded-xl border border-white/8 bg-[#1a1a1a] overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/8 text-white/25">
                            {['Mes','Proveedor','Tokens','Queries','Costo'].map(h=>(
                              <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {limitsData.usage.by_month.map((r,i)=>{
                            const meta = PROVIDER_META[r.provider] ?? PROVIDER_META['Otro']
                            const { Logo } = meta
                            return (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                                <td className="px-5 py-3 font-mono text-white/60">{r.month}</td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2">
                                    <Logo size={13}/>
                                    <span style={{color:meta.color}}>{r.provider}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3 tabular-nums text-white/60 font-mono">{fmtK(r.tokens)}</td>
                                <td className="px-5 py-3 tabular-nums text-white/40">{r.queries}</td>
                                <td className="px-5 py-3 tabular-nums font-mono" style={{color:meta.color}}>{fmt$(r.cost)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── SUSCRIPCIONES ────────────────────────────────────────────── */}
        {tab==='suscripciones' && (
          <div className="space-y-10">
            <p className="text-white/40 text-sm">
              Límites de tokens y capacidades por tipo de suscripción.
              <strong className="text-white/60"> TPM</strong> = tokens por minuto,
              <strong className="text-white/60"> RPM</strong> = requests por minuto.
            </p>

            {(Object.entries(TIERS) as [keyof typeof TIERS, (typeof TIERS)[keyof typeof TIERS]][]).map(([key,ai])=>(
              <div key={key}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{borderColor:`${ai.color}40`,background:`${ai.color}15`}}>
                    <ai.Logo size={22}/>
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{ai.label}</h2>
                    <p className="text-xs text-white/30">Planes consumer + API tiers</p>
                  </div>
                </div>

                <h3 className="text-[10px] uppercase tracking-widest text-white/25 mb-3">Planes consumer</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {ai.consumer.map(plan=>(
                    <div key={plan.name} className={`rounded-xl border p-5 ${plan.highlight ? 'border-opacity-40' : 'border-white/8 bg-[#1a1a1a]'}`}
                      style={plan.highlight ? {borderColor:`${ai.color}50`,background:`${ai.color}08`} : {}}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{plan.name}</span>
                          {plan.highlight && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{background:`${ai.color}25`,color:ai.color}}>
                              Popular
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold tabular-nums" style={{color:ai.color}}>{plan.price}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {plan.features.map((f,i)=>(
                          <li key={i} className="flex items-start gap-2 text-xs text-white/45">
                            <span className="mt-0.5 shrink-0" style={{color:ai.color}}>✓</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <h3 className="text-[10px] uppercase tracking-widest text-white/25 mb-3">API tiers (developers)</h3>
                <div className="rounded-xl border border-white/8 bg-[#1a1a1a] overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-white/25 text-xs">
                        {['Tier','Requisito','TPM','RPM','Nota'].map(h=>(
                          <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ai.api.map((t,i)=>(
                        <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                          <td className="px-5 py-3 font-bold text-sm" style={{color:ai.color}}>{t.tier}</td>
                          <td className="px-5 py-3 text-white/50">{t.req}</td>
                          <td className="px-5 py-3 text-white/70 tabular-nums font-mono">{t.tpm}</td>
                          <td className="px-5 py-3 text-white/70 tabular-nums font-mono">{t.rpm}</td>
                          <td className="px-5 py-3 text-white/25 text-xs">{t.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {key!=='gemini' && <div className="border-t border-white/5 mt-8"/>}
              </div>
            ))}

            <div className="rounded-xl border border-white/8 bg-[#1a1a1a] p-5 flex gap-3">
              <Info size={14} className="text-white/25 mt-0.5 shrink-0"/>
              <p className="text-xs text-white/35 leading-relaxed">
                <strong className="text-white/55">Mollo usa las APIs de pago por token</strong> — no los planes consumer.
                El routing inteligente elige automáticamente el modelo más económico para cada tipo de query,
                optimizando entre GPT-4o-mini ($0.15/MTok) → GPT-4o ($2.50/MTok) → Claude Sonnet ($3.00/MTok).
                El tab &ldquo;Por Tema&rdquo; desglosa exactamente cuánto costó cada área de tu negocio.
              </p>
            </div>
          </div>
        )}

        {/* ── TOPOLOGÍA ──────────────────────────────────────────────── */}
        {tab==='topologia' && (
          <div>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-white/70 mb-1">Red de Servicios VPS</h2>
              <p className="text-xs text-white/30">Click en un nodo para escanear sus detalles y conexiones · Drag para reorganizar</p>
            </div>
            <TopologyTab />
          </div>
        )}
      </div>
    </div>
  )
}
