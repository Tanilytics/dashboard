import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '#/components/layout/dashboard-layout'
import { requireAuth } from '#/lib/auth-guards'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
  beforeLoad: requireAuth,
})
