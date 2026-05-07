'use client'
import { CheckCircle, Mail } from 'lucide-react'

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-[#212121] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">¡Pago confirmado!</h1>
        <p className="text-white/40 mb-8">Tu suscripción está activa.</p>

        <div className="rounded-2xl border border-white/8 bg-[#1a1a1a] p-6 text-left">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Mail size={14} className="text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">Revisa tu email</p>
              <p className="text-sm text-white/40">
                Te enviamos tu API key al correo registrado. Puede tardar unos minutos en llegar.
                Revisa también la carpeta de spam.
              </p>
            </div>
          </div>
          <p className="text-xs text-amber-400/70 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            La API key solo se envía una vez. Si no la recibes, escríbenos a agarza@bion-business.com
          </p>
        </div>

        <a href="/sinergy/"
          className="inline-block mt-6 text-sm text-white/30 hover:text-white/60 transition-colors">
          Volver al inicio →
        </a>
      </div>
    </div>
  )
}
