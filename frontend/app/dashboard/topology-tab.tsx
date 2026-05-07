'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

/* ── Paleta ──────────────────────────────────────────────────── */
const C: Record<string, string> = {
  input:    '#4499ff',   // canales de entrada
  brain:    '#00d4ff',   // mollo brain
  context:  '#aa44ff',   // capa de contexto
  openai:   '#10b981',   // modelos OpenAI
  anthropic:'#cf7c50',   // modelos Anthropic
  provider: '#ffcc00',   // APIs de providers
  output:   '#8b949e',   // salida / tracking
}
const GN: Record<string, string> = {
  input:    'ENTRADA',
  brain:    'MOLLO BRAIN',
  context:  'CONTEXTO / RAG',
  openai:   'OPENAI',
  anthropic:'ANTHROPIC',
  provider: 'PROVIDER API',
  output:   'SALIDA / TRACKING',
}

/* ── Tipos ───────────────────────────────────────────────────── */
interface ModelStat {
  model: string; modo: string; queries: number
  input_tokens: number; output_tokens: number
  actual_cost: number; baseline_cost: number; savings: number
}
interface Lifetime {
  queries: number; input_tokens: number|null; output_tokens: number|null
  cache_tokens: number|null; actual_cost: number|null
  baseline_cost: number|null; savings: number|null; savings_pct: number
}
interface TopoData { lifetime: Lifetime; by_model: ModelStat[] }

interface Node {
  id: string; label: string; sub: string; group: string
  r: number; x: number; y: number; vx: number; vy: number
  fx?: number; fy?: number
  /* performance */
  queries: number; tokens: number; cost: number; pct: number
  info: string; detail: string
}
interface Link {
  source: string; target: string; type: 'main'|'flow'|'data'
  weight: number   // 0-1, drives line thickness
}

/* ── Hex grid ────────────────────────────────────────────────── */
function drawHexGrid(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const S = 24, hh = S * Math.sqrt(3)
  ctx.strokeStyle = '#001520'; ctx.lineWidth = 0.5
  for (let row = -1; row < H / hh + 2; row++) {
    for (let col = -1; col < W / (S * 1.5) + 2; col++) {
      const x = col * S * 1.5
      const y = row * hh + (col % 2 === 0 ? 0 : hh / 2)
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        i === 0 ? ctx.moveTo(x+(S-1)*Math.cos(a), y+(S-1)*Math.sin(a))
                : ctx.lineTo(x+(S-1)*Math.cos(a), y+(S-1)*Math.sin(a))
      }
      ctx.closePath(); ctx.stroke()
    }
  }
  const vg = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.75)
  vg.addColorStop(0,'rgba(0,8,16,0)'); vg.addColorStop(1,'rgba(0,0,6,0.92)')
  ctx.fillStyle = vg; ctx.fillRect(0,0,W,H)
}

/* ── Build topology from real data ───────────────────────────── */
function buildTopology(data: TopoData | null, W: number, H: number): { nodes: Node[], links: Link[] } {
  const cx = W/2, cy = H/2
  const lt = data?.lifetime
  const bm = data?.by_model ?? []
  const totalQ = lt?.queries ?? 1

  const stat = (id: string) => bm.find(m =>
    (id==='gpt_mini'    && m.model==='gpt-4o-mini' && m.modo!=='probe') ||
    (id==='gpt_4o'      && m.model==='gpt-4o') ||
    (id==='claude_son'  && m.model==='claude-sonnet-4-6') ||
    (id==='claude_haiku'&& m.model==='claude-haiku-4-5' && m.modo==='probe')
  )

  const sm  = stat('gpt_mini')    ?? { queries:0, input_tokens:0, output_tokens:0, actual_cost:0, baseline_cost:0, savings:0 }
  const s4o = stat('gpt_4o')      ?? { queries:0, input_tokens:0, output_tokens:0, actual_cost:0, baseline_cost:0, savings:0 }
  const sc  = stat('claude_son')  ?? { queries:0, input_tokens:0, output_tokens:0, actual_cost:0, baseline_cost:0, savings:0 }
  const sh  = stat('claude_haiku')?? { queries:0, input_tokens:0, output_tokens:0, actual_cost:0, baseline_cost:0, savings:0 }

  const totalCost = lt?.actual_cost ?? 0
  const savingsPct = lt?.savings_pct ?? 0

  /* radius scaling: 10-28 based on query share */
  const rScale = (q: number) => 10 + Math.min(18, (q / Math.max(totalQ,1)) * 90)

  /* pre-positions (clock layout: input left, brain center, context upper-left,
     models upper-right, providers right, output bottom) */
  const nodes: Node[] = [
    /* ── INPUT CHANNELS ── */
    {
      id:'telegram', label:'TELEGRAM', sub:'bot input',
      group:'input', r:13, x:cx-310, y:cy-80, vx:0,vy:0,
      queries:0, tokens:0, cost:0, pct:0,
      info:'Canal de entrada principal · Bot de Telegram',
      detail:'Interfaz conversacional directa. Todas las queries del usuario a través de Telegram llegan aquí primero.',
    },
    {
      id:'gateway', label:'GATEWAY', sub:':8100',
      group:'input', r:12, x:cx-310, y:cy+20, vx:0,vy:0,
      queries:0, tokens:0, cost:0, pct:0,
      info:'API Gateway · proxy de entrada',
      detail:'Punto de entrada para queries via API REST. Autentica y enruta al Brain.',
    },
    {
      id:'mcp', label:'MCP SERVER', sub:':3456',
      group:'input', r:11, x:cx-300, y:cy+110, vx:0,vy:0,
      queries:0, tokens:0, cost:0, pct:0,
      info:'Model Context Protocol · Claude Code',
      detail:'Permite a Claude Code (y otros LLMs) acceder al ecosistema Mollo como herramientas.',
    },

    /* ── BRAIN HUB ── */
    {
      id:'brain', label:'MOLLO BRAIN', sub:`${totalQ} queries`,
      group:'brain', r:30, x:cx-60, y:cy, vx:0,vy:0, fx:cx-60, fy:cy,
      queries:totalQ, tokens:(lt?.input_tokens??0)+(lt?.output_tokens??0),
      cost:totalCost, pct:100,
      info:`Hub central · ${totalQ} queries procesadas · $${totalCost.toFixed(4)} total`,
      detail:`Orquestador principal de Mollo. Recibe todas las consultas, coordina el enriquecimiento de contexto y el routing al modelo correcto. Ahorro acumulado: ${savingsPct}% vs todo-Claude.`,
    },

    /* ── CONTEXT LAYER ── */
    {
      id:'classifier', label:'CLASIFICADOR', sub:'complexity router',
      group:'context', r:16, x:cx+60, y:cy-120, vx:0,vy:0,
      queries:totalQ, tokens:0, cost:0, pct:100,
      info:'Routing inteligente: simple→GPT-mini · medio→GPT-4o · complejo→Claude',
      detail:`Clasifica cada query por complejidad usando GPT-4o-mini. Routea al modelo más económico que pueda resolverla correctamente.\n\nSimple (${Math.round((sm.queries/Math.max(totalQ,1))*100)}%) → GPT-4o-mini\nAgente (${Math.round((s4o.queries/Math.max(totalQ,1))*100)}%) → GPT-4o\nComplejo (${Math.round((sc.queries/Math.max(totalQ,1))*100)}%) → Claude Sonnet`,
    },
    {
      id:'embeddings', label:'EMBEDDINGS', sub:'text-embedding',
      group:'context', r:12, x:cx-130, y:cy-170, vx:0,vy:0,
      queries:totalQ, tokens:0, cost:0, pct:0,
      info:'Conversión de texto a vectores para búsqueda semántica',
      detail:'Convierte cada query a un vector de alta dimensionalidad para buscar contexto relevante en Qdrant.',
    },
    {
      id:'qdrant', label:'QDRANT', sub:':6333 · vector DB',
      group:'context', r:14, x:cx-50, y:cy-200, vx:0,vy:0,
      queries:totalQ, tokens:0, cost:0, pct:0,
      info:'Base de datos vectorial · búsqueda semántica de documentos',
      detail:'Almacena y busca embeddings de documentos del negocio. Provee contexto relevante para cada query basado en similitud semántica.',
    },
    {
      id:'topic_mem', label:'TOPIC MEMORY', sub:'memoria especializada',
      group:'context', r:12, x:cx-220, y:cy-150, vx:0,vy:0,
      queries:0, tokens:0, cost:0, pct:0,
      info:'Memoria por tema: finanzas, estrategia, ventas, VPS…',
      detail:'Sistema de memoria especializada por área de negocio. Mollo recuerda conversaciones y aprendizajes organizados por tema.',
    },
    {
      id:'biz_ctx', label:'CONTEXTO BIZ', sub:'contexto estático',
      group:'context', r:11, x:cx-230, y:cy-50, vx:0,vy:0,
      queries:0, tokens:0, cost:0, pct:0,
      info:'Contexto del negocio de Adolfo · system prompt cacheado',
      detail:'Información estática del negocio: empresa, proyectos, equipo, objetivos. Se cachea en Anthropic para reducir costos.',
    },
    {
      id:'prompt_cache', label:'PROMPT CACHE', sub:`${lt?.cache_tokens??0} tokens`,
      group:'context', r:12, x:cx+80, y:cy-220, vx:0,vy:0,
      queries:0, tokens:lt?.cache_tokens??0, cost:0, pct:0,
      info:'Cache de Anthropic · reduce costo de tokens de entrada en 90%',
      detail:'El system prompt de Mollo (1,200 tokens) se cachea en la API de Anthropic. Cada llamada a Claude que hace cache hit paga solo el 10% del costo normal de input.',
    },

    /* ── AI MODELS ── */
    {
      id:'gpt_mini', label:'GPT-4o-mini', sub:`${sm.queries}q · $${sm.actual_cost.toFixed(4)}`,
      group:'openai', r:Math.max(12,rScale(sm.queries)),
      x:cx+210, y:cy-160, vx:0,vy:0,
      queries:sm.queries, tokens:sm.input_tokens+sm.output_tokens,
      cost:sm.actual_cost, pct:Math.round((sm.queries/Math.max(totalQ,1))*100),
      info:`${sm.queries} queries · ${sm.input_tokens+sm.output_tokens} tokens · $${sm.actual_cost.toFixed(4)}`,
      detail:`Modelo principal para queries simples. El más eficiente en costo.\n\n• Queries: ${sm.queries} (${Math.round((sm.queries/Math.max(totalQ,1))*100)}% del total)\n• Input: ${sm.input_tokens} tokens\n• Output: ${sm.output_tokens} tokens\n• Costo real: $${sm.actual_cost.toFixed(5)}\n• Ahorro vs Claude: $${sm.savings.toFixed(4)}`,
    },
    {
      id:'gpt_4o', label:'GPT-4o AGENT', sub:`${s4o.queries}q · $${s4o.actual_cost.toFixed(4)}`,
      group:'openai', r:Math.max(11,rScale(s4o.queries)),
      x:cx+220, y:cy-40, vx:0,vy:0,
      queries:s4o.queries, tokens:s4o.input_tokens+s4o.output_tokens,
      cost:s4o.actual_cost, pct:Math.round((s4o.queries/Math.max(totalQ,1))*100),
      info:`${s4o.queries} queries · tools habilitadas · $${s4o.actual_cost.toFixed(4)}`,
      detail:`Agente con herramientas (web search, calculadora, código). Se activa para queries que requieren acción en el mundo real.\n\n• Queries: ${s4o.queries}\n• Tokens: ${s4o.input_tokens+s4o.output_tokens}\n• Costo: $${s4o.actual_cost.toFixed(5)}\n• Max iterations: 8`,
    },
    {
      id:'claude_son', label:'CLAUDE SONNET', sub:`${sc.queries}q · $${sc.actual_cost.toFixed(4)}`,
      group:'anthropic', r:Math.max(13,rScale(sc.queries)+4),
      x:cx+210, y:cy+100, vx:0,vy:0,
      queries:sc.queries, tokens:sc.input_tokens+sc.output_tokens,
      cost:sc.actual_cost, pct:Math.round((sc.queries/Math.max(totalQ,1))*100),
      info:`${sc.queries} queries complejas · mayor calidad · $${sc.actual_cost.toFixed(4)}`,
      detail:`Reservado para queries de alta complejidad que requieren razonamiento profundo, análisis estratégico o síntesis de información compleja.\n\n• Queries: ${sc.queries}\n• Input: ${sc.input_tokens} tokens\n• Output: ${sc.output_tokens} tokens\n• Costo: $${sc.actual_cost.toFixed(5)}\n• Prompt caching habilitado`,
    },
    {
      id:'claude_haiku', label:'CLAUDE HAIKU', sub:`${sh.queries} probes`,
      group:'anthropic', r:11,
      x:cx+200, y:cy+200, vx:0,vy:0,
      queries:sh.queries, tokens:sh.input_tokens+sh.output_tokens,
      cost:sh.actual_cost, pct:0,
      info:`${sh.queries} probes de rate limit · mínimo costo`,
      detail:`Usado exclusivamente para sondear los rate limits reales de Anthropic. Se llama con max_tokens=1 para capturar los headers de límites sin gastar tokens.\n\n• Probes: ${sh.queries}\n• Tokens: ${sh.input_tokens+sh.output_tokens}\n• Costo: $${sh.actual_cost.toFixed(6)}`,
    },

    /* ── PROVIDERS ── */
    {
      id:'openai_api', label:'OPENAI API', sub:`$${(sm.actual_cost+s4o.actual_cost).toFixed(4)}`,
      group:'provider', r:16, x:cx+340, y:cy-100, vx:0,vy:0,
      queries:sm.queries+s4o.queries,
      tokens:sm.input_tokens+sm.output_tokens+s4o.input_tokens+s4o.output_tokens,
      cost:sm.actual_cost+s4o.actual_cost, pct:0,
      info:`OpenAI API · GPT-4o-mini + GPT-4o · $${(sm.actual_cost+s4o.actual_cost).toFixed(4)}`,
      detail:`Provider principal en volumen de queries. Maneja modelos GPT-4o-mini (simple) y GPT-4o (agente).\n\n• Total queries: ${sm.queries+s4o.queries}\n• Costo total: $${(sm.actual_cost+s4o.actual_cost).toFixed(5)}\n• Modelo dominante: GPT-4o-mini`,
    },
    {
      id:'anthropic_api', label:'ANTHROPIC API', sub:`$${(sc.actual_cost+sh.actual_cost).toFixed(4)}`,
      group:'provider', r:16, x:cx+340, y:cy+120, vx:0,vy:0,
      queries:sc.queries+sh.queries,
      tokens:sc.input_tokens+sc.output_tokens+sh.input_tokens+sh.output_tokens,
      cost:sc.actual_cost+sh.actual_cost, pct:0,
      info:`Anthropic API · Claude Sonnet + Haiku · $${(sc.actual_cost+sh.actual_cost).toFixed(4)}`,
      detail:`Provider Anthropic. Aunque tiene menor volumen de queries, concentra el mayor costo por llamada.\n\n• Total queries: ${sc.queries+sh.queries}\n• Costo total: $${(sc.actual_cost+sh.actual_cost).toFixed(5)}\n• Prompt caching reduce costo de input 90%`,
    },

    /* ── OUTPUT / TRACKING ── */
    {
      id:'cost_db', label:'COST TRACKER', sub:`${totalQ} registros`,
      group:'output', r:13, x:cx+80, y:cy+220, vx:0,vy:0,
      queries:totalQ, tokens:0, cost:totalCost, pct:0,
      info:`SQLite · ${totalQ} registros · ahorro total: ${savingsPct}%`,
      detail:`Base de datos SQLite en ~/.mollo/costs.db. Registra cada llamada a modelo con tokens reales, costo actual y ahorro vs baseline.\n\n• Total registros: ${totalQ}\n• Costo acumulado: $${totalCost.toFixed(5)}\n• Ahorro vs todo-Claude: ${savingsPct}%\n• Baseline (todo Claude): $${(lt?.baseline_cost??0).toFixed(4)}`,
    },
    {
      id:'memory_store', label:'MEMORY STORE', sub:'conversaciones + aprendizajes',
      group:'output', r:13, x:cx-100, y:cy+200, vx:0,vy:0,
      queries:0, tokens:0, cost:0, pct:0,
      info:'PostgreSQL + Qdrant · historial semántico por sesión',
      detail:'Almacena el historial de conversaciones y extrae aprendizajes automáticamente. Permite contexto semántico en futuras queries.',
    },
  ]

  const links: Link[] = [
    /* input → brain */
    { source:'telegram',  target:'brain',       type:'main', weight:0.9 },
    { source:'gateway',   target:'brain',       type:'main', weight:0.5 },
    { source:'mcp',       target:'brain',       type:'main', weight:0.3 },
    /* brain → context */
    { source:'brain',     target:'embeddings',  type:'flow', weight:0.8 },
    { source:'brain',     target:'topic_mem',   type:'flow', weight:0.6 },
    { source:'brain',     target:'biz_ctx',     type:'flow', weight:0.6 },
    { source:'brain',     target:'classifier',  type:'main', weight:1.0 },
    /* context enrichment */
    { source:'embeddings',target:'qdrant',      type:'flow', weight:0.8 },
    { source:'qdrant',    target:'classifier',  type:'data', weight:0.7 },
    { source:'topic_mem', target:'classifier',  type:'data', weight:0.5 },
    { source:'biz_ctx',   target:'classifier',  type:'data', weight:0.5 },
    /* cache */
    { source:'prompt_cache',target:'classifier',type:'data', weight:0.4 },
    /* routing → models */
    { source:'classifier',target:'gpt_mini',    type:'main', weight:Math.max(0.2,sm.queries/Math.max(totalQ,1)) },
    { source:'classifier',target:'gpt_4o',      type:'main', weight:Math.max(0.1,s4o.queries/Math.max(totalQ,1)) },
    { source:'classifier',target:'claude_son',  type:'main', weight:Math.max(0.1,sc.queries/Math.max(totalQ,1)) },
    /* models → providers */
    { source:'gpt_mini',  target:'openai_api',  type:'flow', weight:Math.max(0.2,sm.queries/Math.max(totalQ,1)) },
    { source:'gpt_4o',    target:'openai_api',  type:'flow', weight:Math.max(0.1,s4o.queries/Math.max(totalQ,1)) },
    { source:'claude_son',target:'anthropic_api',type:'flow',weight:Math.max(0.1,sc.queries/Math.max(totalQ,1)) },
    { source:'claude_haiku',target:'anthropic_api',type:'data',weight:0.15 },
    /* providers → cost tracker */
    { source:'openai_api',   target:'cost_db',  type:'data', weight:0.5 },
    { source:'anthropic_api',target:'cost_db',  type:'data', weight:0.3 },
    /* output → memory */
    { source:'openai_api',   target:'memory_store', type:'data', weight:0.4 },
    { source:'anthropic_api',target:'memory_store', type:'data', weight:0.2 },
  ]

  return { nodes, links }
}

/* ── Component ───────────────────────────────────────────────── */
export default function TopologyTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef  = useRef<Node[]>([])
  const linksRef  = useRef<Link[]>([])
  const rafRef    = useRef<number>(0)
  const bgRef     = useRef<HTMLCanvasElement|null>(null)
  const partRef   = useRef<{li:number; t:number; spd:number}[]>([])
  const [selected, setSelected] = useState<Node|null>(null)
  const [data, setData]         = useState<TopoData|null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const dragging   = useRef<Node|null>(null)
  const mouseRef   = useRef({x:0,y:0})
  const selectedRef= useRef<Node|null>(null)
  const [, forceRender] = useState(0)
  const dimsRef    = useRef({W:900,H:660})

  /* fetch live data */
  const loadData = useCallback(async () => {
    try {
      const [sumRes, bmRes] = await Promise.all([
        fetch('/mollo/api/costs?endpoint=summary'),
        fetch('/mollo/api/costs?endpoint=by_model'),
      ])
      const sum = await sumRes.json()
      const bm  = await bmRes.json()
      setData({ lifetime: sum.lifetime, by_model: bm })
      setLastUpdate(new Date().toLocaleTimeString('es-MX'))
    } catch { /* silent */ }
  }, [])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => {
    const iv = setInterval(loadData, 60000)
    return () => clearInterval(iv)
  }, [loadData])

  /* keep ref in sync so the RAF loop always sees the current selection */
  useEffect(() => { selectedRef.current = selected }, [selected])

  /* init / rebuild canvas when data changes */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.offsetWidth || 900
    const H = 660
    canvas.width = W; canvas.height = H
    dimsRef.current = {W,H}
    const { nodes, links } = buildTopology(data, W, H)
    nodesRef.current  = nodes
    linksRef.current  = links
    partRef.current   = links.map((_,i)=>({li:i, t:Math.random(), spd:0.003+Math.random()*0.003}))

    const bg = document.createElement('canvas')
    bg.width=W; bg.height=H
    drawHexGrid(bg.getContext('2d')!, W, H)
    bgRef.current = bg

    const ctx = canvas.getContext('2d')!
    const cx=W/2, cy=H/2

    function physics() {
      const ns = nodesRef.current, ls = linksRef.current
      const map = new Map(ns.map(n=>[n.id,n]))
      ns.forEach(n=>{ n.vx=0; n.vy=0 })
      for(let i=0;i<ns.length;i++) for(let j=i+1;j<ns.length;j++){
        const a=ns[i],b=ns[j], dx=a.x-b.x, dy=a.y-b.y
        const d=Math.sqrt(dx*dx+dy*dy)||1, f=3800/(d*d)
        a.vx+=(dx/d)*f; a.vy+=(dy/d)*f
        b.vx-=(dx/d)*f; b.vy-=(dy/d)*f
      }
      ls.forEach(l=>{
        const s=map.get(l.source), t=map.get(l.target)
        if(!s||!t) return
        const dx=t.x-s.x, dy=t.y-s.y, d=Math.sqrt(dx*dx+dy*dy)||1
        const rest=l.type==='main'?150:80
        const f=(d-rest)*0.06
        s.vx+=(dx/d)*f; s.vy+=(dy/d)*f
        t.vx-=(dx/d)*f; t.vy-=(dy/d)*f
      })
      ns.forEach(n=>{
        n.vx+=(cx-n.x)*0.012; n.vy+=(cy-n.y)*0.012
        if(n.fx!==undefined){n.x=n.fx!;n.y=n.fy!;return}
        n.x+=n.vx*0.4; n.y+=n.vy*0.4
        n.x=Math.max(n.r+8,Math.min(W-n.r-8,n.x))
        n.y=Math.max(n.r+8,Math.min(H-n.r-8,n.y))
      })
    }

    function draw(selId?: string) {
      const ns=nodesRef.current, ls=linksRef.current
      const map=new Map(ns.map(n=>[n.id,n]))

      const sel=selId?ns.find(n=>n.id===selId):null
      const connSet: Set<string> = new Set()
      if(sel){ connSet.add(sel.id); ls.forEach(l=>{ if(l.source===sel.id)connSet.add(l.target); if(l.target===sel.id)connSet.add(l.source) }) }

      ctx.clearRect(0,0,W,H)
      ctx.drawImage(bgRef.current!,0,0)

      /* rings */
      ctx.setLineDash([3,9])
      ;[80,160,240,320].forEach(r=>{
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2)
        ctx.strokeStyle='#001a2e'; ctx.lineWidth=0.8; ctx.stroke()
      })
      for(let i=0;i<8;i++){
        const a=(i/8)*Math.PI*2
        ctx.beginPath(); ctx.moveTo(cx,cy)
        ctx.lineTo(cx+320*Math.cos(a),cy+320*Math.sin(a))
        ctx.strokeStyle='#001020'; ctx.lineWidth=0.5; ctx.stroke()
      }
      ctx.setLineDash([])

      /* links */
      ls.forEach((l,idx)=>{
        const s=map.get(l.source), t=map.get(l.target)
        if(!s||!t) return
        const active=!sel||(connSet.has(l.source)&&connSet.has(l.target))
        ctx.globalAlpha=sel?(active?1:0.04):0.65
        const col=active&&sel?C[s.group]||'#00d4ff':(l.type==='main'?'#002a44':l.type==='flow'?'#001d30':'#001520')

        /* arrowhead direction */
        const angle=Math.atan2(t.y-s.y,t.x-s.x)
        const dLen=Math.sqrt((t.x-s.x)**2+(t.y-s.y)**2)
        const ex=t.x-Math.cos(angle)*(t.r+4), ey=t.y-Math.sin(angle)*(t.r+4)
        const sx=s.x+Math.cos(angle)*(s.r+4), sy=s.y+Math.sin(angle)*(s.r+4)

        if(l.type==='data') ctx.setLineDash([3,5])
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey)
        ctx.strokeStyle=col
        ctx.lineWidth=(active&&sel)?Math.max(2.5,l.weight*5+2):Math.max(0.5,l.weight*2)
        if(active&&sel){ ctx.shadowColor=col; ctx.shadowBlur=18 }
        ctx.stroke()
        /* second pass for extra glow on active links */
        if(active&&sel){
          ctx.globalAlpha=0.35
          ctx.lineWidth=Math.max(5,l.weight*10+4)
          ctx.strokeStyle=col; ctx.shadowBlur=0
          ctx.stroke()
          ctx.globalAlpha=1
        }
        ctx.shadowBlur=0; ctx.setLineDash([])

        /* arrowhead on flow links */
        if(dLen>40&&(active||!sel)){
          const ar=5*l.weight+2.5
          ctx.beginPath()
          ctx.moveTo(ex,ey)
          ctx.lineTo(ex-ar*Math.cos(angle-0.4),ey-ar*Math.sin(angle-0.4))
          ctx.lineTo(ex-ar*Math.cos(angle+0.4),ey-ar*Math.sin(angle+0.4))
          ctx.closePath()
          ctx.fillStyle=col; ctx.fill()
        }
        void idx
      })
      ctx.globalAlpha=1

      /* particles */
      partRef.current.forEach(p=>{
        const l=ls[p.li]
        const s=map.get(l.source), t=map.get(l.target)
        if(!s||!t) return
        const active=!sel||(connSet.has(l.source)&&connSet.has(l.target))
        const x=s.x+(t.x-s.x)*p.t, y=s.y+(t.y-s.y)*p.t
        const col=C[s.group]||'#00d4ff'
        ctx.globalAlpha=sel?(active?0.95:0.04):0.55
        const pr=active&&sel?3:1.8
        ctx.beginPath(); ctx.arc(x,y,pr,0,Math.PI*2)
        ctx.shadowColor=col; ctx.shadowBlur=active&&sel?10:4
        ctx.fillStyle=col; ctx.fill()
        ctx.shadowBlur=0
      })
      ctx.globalAlpha=1

      /* nodes */
      ns.forEach(n=>{
        const dimmed=sel&&!connSet.has(n.id)
        ctx.globalAlpha=dimmed?0.08:1
        const col=C[n.group]||'#00d4ff'
        const isSel=n.id===selId

        if(isSel){
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r+14,0,Math.PI*2)
          ctx.setLineDash([3,6])
          ctx.strokeStyle=col; ctx.lineWidth=0.8
          ctx.shadowColor=col; ctx.shadowBlur=6; ctx.stroke()
          ctx.shadowBlur=0; ctx.setLineDash([])
        }

        /* halo */
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r+8,0,Math.PI*2)
        ctx.strokeStyle=col+'22'; ctx.lineWidth=0.5; ctx.stroke()

        /* body */
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2)
        ctx.fillStyle=col+(isSel?'28':'14')
        ctx.shadowColor=col; ctx.shadowBlur=isSel?18:6
        ctx.fill()
        ctx.strokeStyle=col; ctx.lineWidth=isSel?2.2:1.4; ctx.stroke()
        ctx.shadowBlur=0

        /* label */
        ctx.fillStyle=col
        ctx.font=`bold ${n.id==='brain'?11:n.r>=16?9:8}px monospace`
        ctx.textAlign='center'; ctx.textBaseline='middle'
        ctx.shadowColor=col; ctx.shadowBlur=4
        ctx.fillText(n.label, n.x, n.r>=14 ? n.y-4 : n.y)
        ctx.shadowBlur=0

        /* sub-label */
        if(n.r>=12){
          ctx.fillStyle='#004466'
          ctx.font=`6.5px monospace`
          ctx.textBaseline='middle'
          ctx.fillText(n.sub, n.x, n.r>=14 ? n.y+7 : n.y+n.r+9)
        }

        /* query count badge on model nodes */
        if(n.queries>0&&['gpt_mini','gpt_4o','claude_son','claude_haiku','brain'].includes(n.id)){
          const bx=n.x+n.r*0.7, by=n.y-n.r*0.7
          ctx.beginPath(); ctx.arc(bx,by,7,0,Math.PI*2)
          ctx.fillStyle='#000810'; ctx.fill()
          ctx.strokeStyle=col; ctx.lineWidth=1; ctx.stroke()
          ctx.fillStyle=col; ctx.font='bold 7px monospace'
          ctx.textAlign='center'; ctx.textBaseline='middle'
          ctx.fillText(String(n.queries), bx, by)
        }

        ctx.globalAlpha=1
      })

      /* brain pulse rings */
      const brain=ns.find(n=>n.id==='brain')
      if(brain){
        const t=Date.now()/1000
        ;[0,0.8,1.6].forEach(off=>{
          const phase=((t+off)%2.4)/2.4
          ctx.beginPath(); ctx.arc(brain.x,brain.y,brain.r+phase*60,0,Math.PI*2)
          ctx.strokeStyle=C.brain; ctx.lineWidth=0.8
          ctx.globalAlpha=(1-phase)*0.35; ctx.stroke(); ctx.globalAlpha=1
        })
      }
    }

    function frame(){
      physics()
      partRef.current.forEach(p=>{ p.t+=p.spd; if(p.t>1)p.t=0 })
      const selId=selectedRef.current?.id
      draw(selId)
      rafRef.current=requestAnimationFrame(frame)
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current=requestAnimationFrame(frame)
    return ()=>cancelAnimationFrame(rafRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const getNodeAt = useCallback((cx:number,cy:number)=>{
    const canvas=canvasRef.current; if(!canvas) return null
    const rect=canvas.getBoundingClientRect()
    const sx=(cx-rect.left)*(canvas.width/rect.width)
    const sy=(cy-rect.top)*(canvas.height/rect.height)
    return nodesRef.current.find(n=>Math.hypot(n.x-sx,n.y-sy)<=n.r+8)||null
  },[])

  const onMouseDown=useCallback((e:React.MouseEvent)=>{
    dragging.current=getNodeAt(e.clientX,e.clientY)
    mouseRef.current={x:e.clientX,y:e.clientY}
  },[getNodeAt])

  const onMouseMove=useCallback((e:React.MouseEvent)=>{
    const d=dragging.current; if(!d||d.id==='brain') return
    const canvas=canvasRef.current!
    const rect=canvas.getBoundingClientRect()
    const sx=(e.clientX-rect.left)*(canvas.width/rect.width)
    const sy=(e.clientY-rect.top)*(canvas.height/rect.height)
    d.fx=sx; d.fy=sy; d.x=sx; d.y=sy
  },[])

  const onMouseUp=useCallback((e:React.MouseEvent)=>{
    const moved=Math.abs(e.clientX-mouseRef.current.x)+Math.abs(e.clientY-mouseRef.current.y)
    if(dragging.current){
      if(moved<6){
        const n=dragging.current
        setSelected(p=>p?.id===n.id?null:n); forceRender(x=>x+1)
      } else {
        dragging.current.fx=undefined; dragging.current.fy=undefined
      }
      dragging.current=null
    } else if(moved<6){
      const n=getNodeAt(e.clientX,e.clientY)
      n ? (setSelected(p=>p?.id===n.id?null:n), forceRender(x=>x+1)) : setSelected(null)
    }
  },[getNodeAt])

  const connLinks=selected ? linksRef.current.filter(l=>l.source===selected.id||l.target===selected.id) : []
  const connNodes=connLinks.map(l=>l.source===selected?.id?l.target:l.source)

  const lt = data?.lifetime
  const totalQ   = lt?.queries ?? 0
  const totalCost = lt?.actual_cost ?? 0
  const savings   = lt?.savings ?? 0
  const savingsPct= lt?.savings_pct ?? 0

  return (
    <div className="rounded-xl border border-white/8 bg-[#000810] overflow-hidden" style={{position:'relative'}}>

      {/* HUD corners */}
      {(['tl','tr','bl','br'] as const).map(c=>(
        <div key={c} style={{
          position:'absolute',width:20,height:20,zIndex:10,
          ...(c[0]==='t'?{top:10}:{bottom:10}),
          ...(c[1]==='l'?{left:10}:{right:10}),
          borderTop:   c[0]==='t'?'1.5px solid #00d4ff':undefined,
          borderBottom:c[0]==='b'?'1.5px solid #00d4ff':undefined,
          borderLeft:  c[1]==='l'?'1.5px solid #00d4ff':undefined,
          borderRight: c[1]==='r'?'1.5px solid #00d4ff':undefined,
        }}/>
      ))}

      {/* Title */}
      <div style={{position:'absolute',top:13,left:'50%',transform:'translateX(-50%)',fontFamily:'monospace',fontSize:9,color:'#00d4ff',letterSpacing:'2.5px',textShadow:'0 0 12px #00d4ff88',whiteSpace:'nowrap',zIndex:10}}>
        ◈ ECOSISTEMA IA — FLUJO DE QUERIES & PERFORMANCE ◈
      </div>

      {/* Scanline */}
      <style>{`@keyframes scanM{0%{top:-2px}100%{top:102%}}`}</style>
      <div style={{position:'absolute',left:0,right:0,height:1,zIndex:8,pointerEvents:'none',background:'linear-gradient(to right,transparent,#00d4ff22,#00d4ff66,#00d4ff22,transparent)',animation:'scanM 6s linear infinite'}}/>

      {/* KPIs top-right */}
      <div style={{position:'absolute',top:36,right:16,zIndex:10,fontFamily:'monospace',fontSize:8,textAlign:'right',lineHeight:1.8}}>
        <div style={{color:'#004466'}}>TOTAL QUERIES ·· <span style={{color:'#00d4ff'}}>{totalQ}</span></div>
        <div style={{color:'#004466'}}>COSTO REAL ···· <span style={{color:'#ffcc00'}}>${totalCost.toFixed(4)}</span></div>
        <div style={{color:'#004466'}}>AHORRO ········ <span style={{color:'#10b981'}}>{savingsPct}% · ${savings.toFixed(4)}</span></div>
        {lastUpdate && <div style={{color:'#002233'}}>ACT: {lastUpdate}</div>}
      </div>

      {/* Bottom-left info */}
      <div style={{position:'absolute',bottom:13,left:16,zIndex:10,fontFamily:'monospace',fontSize:8,color:'#002233',lineHeight:1.8}}>
        <div>ROUTING ·· simple→GPT-mini · agente→GPT-4o · complejo→Claude</div>
        <div>BASELINE · todo-Claude Sonnet → ${(lt?.baseline_cost??0).toFixed(4)}</div>
      </div>

      {/* Instruction */}
      <div style={{position:'absolute',bottom:34,left:'50%',transform:'translateX(-50%)',fontFamily:'monospace',fontSize:7.5,color:'#001a2e',letterSpacing:'1.5px',whiteSpace:'nowrap',zIndex:10}}>
        CLICK EN NODO PARA ANÁLISIS · DRAG PARA REORGANIZAR · ESC PARA CERRAR
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef}
        style={{width:'100%',height:660,display:'block',cursor:'crosshair'}}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}/>

      {/* Legend */}
      <div style={{position:'absolute',top:42,left:14,zIndex:10,fontFamily:'monospace',fontSize:7.5}}>
        {Object.entries(C).map(([g,c])=>(
          <div key={g} style={{display:'flex',alignItems:'center',gap:5,marginBottom:3,color:'#003a5a'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:c+'22',border:`1px solid ${c}88`,flexShrink:0}}/>
            {GN[g]}
          </div>
        ))}
      </div>

      {/* Side panel */}
      <div style={{
        position:'absolute',top:42,right:14,width:252,
        background:'rgba(0,4,14,0.97)',border:'1px solid #00d4ff22',borderRadius:3,
        padding:'14px 14px 12px',zIndex:20,fontFamily:'monospace',
        transform:selected?'translateX(0)':'translateX(280px)',
        opacity:selected?1:0,
        transition:'transform .35s cubic-bezier(.16,1,.3,1),opacity .3s ease',
        pointerEvents:selected?'auto':'none',
      }}>
        {/* panel corners */}
        {(['tl','tr','bl','br'] as const).map(c=>(
          <div key={c} style={{position:'absolute',width:7,height:7,
            ...(c[0]==='t'?{top:-1}:{bottom:-1}),
            ...(c[1]==='l'?{left:-1}:{right:-1}),
            borderTop:c[0]==='t'?'1px solid #00d4ff':undefined,
            borderBottom:c[0]==='b'?'1px solid #00d4ff':undefined,
            borderLeft:c[1]==='l'?'1px solid #00d4ff':undefined,
            borderRight:c[1]==='r'?'1px solid #00d4ff':undefined,
          }}/>
        ))}
        <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:1,background:'linear-gradient(to right,transparent,#00d4ff99,transparent)'}}/>

        {selected && (<>
          <div style={{fontSize:7.5,color:'#004466',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:2}}>COMPONENTE IA</div>
          <div style={{fontSize:13,fontWeight:'bold',letterSpacing:1.5,color:C[selected.group]||'#00d4ff',marginBottom:2}}>{selected.label}</div>
          <div style={{fontSize:8,letterSpacing:2,marginBottom:10,color:'#00ff88'}}>● ACTIVO · OPERATIVO</div>

          <div style={{borderTop:'1px solid #001a2e',margin:'8px 0'}}/>
          <div style={{fontSize:7.5,color:'#004466',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:2}}>CAPA</div>
          <div style={{fontSize:10,color:C[selected.group]||'#7dd8f0',marginBottom:8}}>{GN[selected.group]}</div>

          {selected.queries > 0 && (<>
            <div style={{fontSize:7.5,color:'#004466',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:2}}>QUERIES PROCESADAS</div>
            <div style={{fontSize:18,fontWeight:'bold',color:C[selected.group]||'#00d4ff',marginBottom:2,letterSpacing:1}}>{selected.queries}</div>
            {selected.pct>0&&<div style={{fontSize:8,color:'#004466',marginBottom:8}}>{selected.pct}% del total</div>}
          </>)}

          {selected.tokens > 0 && (<>
            <div style={{fontSize:7.5,color:'#004466',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:2}}>TOKENS</div>
            <div style={{fontSize:10,color:'#7dd8f0',marginBottom:8}}>{selected.tokens.toLocaleString()}</div>
          </>)}

          {selected.cost > 0 && (<>
            <div style={{fontSize:7.5,color:'#004466',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:2}}>COSTO</div>
            <div style={{fontSize:14,fontWeight:'bold',color:'#ffcc00',marginBottom:2}}>${selected.cost.toFixed(5)}</div>
            <div style={{height:3,borderRadius:2,background:'#001a2e',marginBottom:8}}>
              <div style={{height:'100%',borderRadius:2,width:`${Math.min((selected.cost/Math.max(totalCost,0.001))*100,100)}%`,background:'#ffcc00',transition:'width 1s ease'}}/>
            </div>
          </>)}

          <div style={{borderTop:'1px solid #001a2e',margin:'8px 0'}}/>
          <div style={{fontSize:7.5,color:'#004466',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:4}}>DESCRIPCIÓN</div>
          <div style={{fontSize:8.5,color:'#7dd8f0',lineHeight:1.6,marginBottom:10,whiteSpace:'pre-line'}}>{selected.detail}</div>

          {connLinks.length > 0 && (<>
            <div style={{borderTop:'1px solid #001a2e',margin:'8px 0'}}/>
            <div style={{fontSize:7.5,color:'#004466',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:4}}>CONEXIONES ({connLinks.length})</div>
            {connNodes.map((id,i)=>{
              const nd=nodesRef.current.find(n=>n.id===id)
              if(!nd) return null
              const l=connLinks[i]
              const dir=l.source===selected.id?'→':'←'
              return (
                <div key={i} style={{fontSize:8,color:'#00d4ff55',padding:'2px 0 2px 7px',borderLeft:`1px solid ${C[nd.group]||'#00d4ff'}33`,margin:'2px 0'}}>
                  <span style={{color:C[nd.group]||'#00d4ff'}}>{dir}</span> {nd.label}
                  <span style={{color:'#003a5a'}}> [{l.type}]</span>
                </div>
              )
            })}
          </>)}
        </>)}
      </div>

      {/* refresh button */}
      <button onClick={loadData} style={{
        position:'absolute',bottom:13,right:16,fontFamily:'monospace',fontSize:8,
        color:'#003a5a',background:'none',border:'none',cursor:'pointer',zIndex:10,
        letterSpacing:'1px',
      }}>↻ REFRESH</button>
    </div>
  )
}
