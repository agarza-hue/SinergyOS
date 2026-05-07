import { type NextRequest } from 'next/server'

const BRAIN = 'http://localhost:8002'

export async function GET() {
  try {
    const r = await fetch(`${BRAIN}/sinergy/tenants`, { cache: 'no-store' })
    const data = await r.json()
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Brain no disponible' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const slug   = searchParams.get('slug')

  if (!slug) return Response.json({ error: 'slug requerido' }, { status: 400 })

  const actionMap: Record<string, string> = {
    'rotate-key':   `${BRAIN}/sinergy/tenants/${slug}/rotate-key`,
    'reset-usage':  `${BRAIN}/sinergy/tenants/${slug}/reset-usage`,
    'toggle-admin': `${BRAIN}/sinergy/tenants/${slug}/toggle-admin`,
    'delete':       `${BRAIN}/sinergy/tenants/${slug}`,
    'create':       `${BRAIN}/sinergy/tenants`,
  }

  const url = actionMap[action ?? '']
  if (!url) return Response.json({ error: 'Acción inválida' }, { status: 400 })

  try {
    const body = action === 'create' ? await req.text() : undefined
    const method = action === 'delete' ? 'DELETE' : 'POST'
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
      cache: 'no-store',
    })
    if (r.status === 204) return new Response(null, { status: 204 })
    const data = await r.json()
    return Response.json(data, { status: r.status })
  } catch {
    return Response.json({ error: 'Brain no disponible' }, { status: 503 })
  }
}
