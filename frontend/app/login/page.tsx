'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/sinergy/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/sinergy/dashboard')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Error de autenticación')
        setPassword('')
      }
    } catch {
      setError('No se pudo conectar con el servidor')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#212121] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4">
            <Shield size={28} className="text-violet-400"/>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SinergyOS</h1>
          <p className="text-sm text-white/30 mt-1">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-[#1a1a1a] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-white/15 focus:outline-none focus:border-violet-500/50 focus:bg-white/7 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
              {loading
                ? <><Loader2 size={15} className="animate-spin"/> Verificando…</>
                : 'Entrar al dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/15 text-xs mt-6">
          Sesión válida por 8 horas
        </p>
      </div>
    </div>
  )
}
