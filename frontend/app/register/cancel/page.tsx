'use client'
import { XCircle } from 'lucide-react'

export default function RegisterCancelPage() {
  return (
    <div className="min-h-screen bg-[#212121] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <XCircle size={32} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Pago cancelado</h1>
        <p className="text-white/40 mb-8">No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.</p>

        <a href="/sinergy/register"
          className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-sm">
          Volver al registro
        </a>
      </div>
    </div>
  )
}
