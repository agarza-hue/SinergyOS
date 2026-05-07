'use client'
import dynamic from 'next/dynamic'

const Dashboard = dynamic(() => import('./dashboard-client'), { ssr: false })

export default function DashboardPage() {
  return <Dashboard />
}
