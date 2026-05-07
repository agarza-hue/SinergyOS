import { type NextRequest } from 'next/server'

const BRAIN = 'http://localhost:8002'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') ?? 'probe'

  const path = mode === 'usage' ? '/limits/usage' : '/limits/probe'

  try {
    const r = await fetch(`${BRAIN}${path}`, { cache: 'no-store' })
    const data = await r.json()
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Brain no disponible' }, { status: 503 })
  }
}
