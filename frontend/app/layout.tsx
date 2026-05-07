import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SinergyOS — Agentes IA para tu empresa',
  description: 'Plataforma SaaS de agentes IA empresariales con memoria, RAG y Skills personalizadas.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#0f0f0f] text-[#e5e5e5] antialiased">{children}</body>
    </html>
  )
}
