import { type NextRequest } from 'next/server'

const BRAIN = 'http://localhost:8002'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const endpoint = searchParams.get('endpoint') || 'summary'
  const days     = searchParams.get('days') || '30'
  const limit    = searchParams.get('limit') || '50'

  const pathMap: Record<string, string> = {
    summary:        '/costs/summary',
    lifetime:       '/costs/lifetime',
    daily:          `/costs/daily?days=${days}`,
    by_model:       '/costs/by_model',
    recent:         `/costs/recent?limit=${limit}`,
    by_topic:       '/costs/by_topic',
    by_provider:    '/costs/by_provider',
    topic_by_model: '/costs/topic_by_model',
    by_tenant:      '/costs/by_tenant',
  }

  const path = pathMap[endpoint] ?? '/costs/summary'

  try {
    const r = await fetch(`${BRAIN}${path}`, { cache: 'no-store' })
    const data = await r.json()
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Brain no disponible' }, { status: 503 })
  }
}
