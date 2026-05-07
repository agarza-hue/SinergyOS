// Web Crypto — funciona en Edge Runtime (middleware) y Node.js (API routes)
const enc = new TextEncoder()

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  )
  const buf = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const SECRET  = process.env.SINERGY_SESSION_SECRET ?? 'dev-secret-change-in-prod'
const MAX_AGE = 60 * 60 * 8  // 8 horas en segundos
export const COOKIE = 'sinergy_session'

export async function makeToken(): Promise<string> {
  const exp     = Date.now() + MAX_AGE * 1000
  const payload = `sinergy:${exp}`
  const sig     = await hmac(SECRET, payload)
  return `${payload}.${sig}`
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const lastDot = token.lastIndexOf('.')
    if (lastDot < 0) return false
    const payload  = token.slice(0, lastDot)
    const sig      = token.slice(lastDot + 1)
    const expected = await hmac(SECRET, payload)
    if (sig !== expected) return false
    const exp = parseInt(payload.split(':')[1] ?? '0', 10)
    return Date.now() < exp
  } catch {
    return false
  }
}

export { MAX_AGE }
