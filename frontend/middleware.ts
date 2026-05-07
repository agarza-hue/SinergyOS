import { type NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Con basePath='/sinergy', Next.js expone las rutas sin el prefijo en middleware
  if (!pathname.startsWith('/dashboard')) return NextResponse.next()

  const token = req.cookies.get(COOKIE)?.value ?? ''
  if (await verifyToken(token)) return NextResponse.next()

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
