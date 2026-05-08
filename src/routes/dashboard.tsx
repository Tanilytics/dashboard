import { createFileRoute, redirect } from '@tanstack/react-router'
import { DashboardLayout } from '#/components/layout/dashboard-layout'

function requireAuth() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  }
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
  beforeLoad: requireAuth,
})
