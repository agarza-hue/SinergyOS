import { type NextRequest } from 'next/server'

const BRAIN = 'http://localhost:8002'

export async function POST(req: NextRequest) {
  try {
    const body = await req.arrayBuffer()
    const r = await fetch(`${BRAIN}/sinergy/billing/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type':    req.headers.get('content-type') ?? 'application/json',
        'stripe-signature': req.headers.get('stripe-signature') ?? '',
      },
      body,
      cache: 'no-store',
    })
    const data = await r.json()
    return Response.json(data, { status: r.status })
  } catch {
    return Response.json({ error: 'Brain no disponible' }, { status: 503 })
  }
}
