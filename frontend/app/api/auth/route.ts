import { makeToken, COOKIE, MAX_AGE } from '@/lib/auth'

const PASSWORD = process.env.SINERGY_ADMIN_PASSWORD ?? 'SinergyOS2026!'

// POST /api/auth  →  login
export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }))

  if (!password || password !== PASSWORD) {
    return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const token = await makeToken()
  return Response.json({ ok: true }, {
    headers: {
      'Set-Cookie': `${COOKIE}=${token}; HttpOnly; Path=/sinergy; Max-Age=${MAX_AGE}; SameSite=Lax`,
    },
  })
}

// DELETE /api/auth  →  logout
export async function DELETE() {
  return Response.json({ ok: true }, {
    headers: {
      'Set-Cookie': `${COOKIE}=; HttpOnly; Path=/sinergy; Max-Age=0; SameSite=Lax`,
    },
  })
}
