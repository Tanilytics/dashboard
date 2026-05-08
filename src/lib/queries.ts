import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sitesApi, analyticsApi } from '#/lib/api'

export function getLast7Days(): { from: string; to: string } {
  const to = new Date().toISOString()
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  return { from, to }
}

export function getLast30Days(): { from: string; to: string } {
  const to = new Date().toISOString()
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  return { from, to }
}

export function getDateRange(range: string): { from: string; to: string } {
  const to = new Date().toISOString()
  const now = Date.now()
  let ms = 7 * 24 * 60 * 60 * 1000
  switch (range) {
    case '24h':
      ms = 24 * 60 * 60 * 1000
      break
    case '7d':
      ms = 7 * 24 * 60 * 60 * 1000
      break
    case '30d':
      ms = 30 * 24 * 60 * 60 * 1000
      break
    case '90d':
      ms = 90 * 24 * 60 * 60 * 1000
      break
  }
  const from = new Date(now - ms).toISOString()
  return { from, to }
}

// Auth
export function useUser() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      // Decode basic info from JWT payload since there's no /me endpoint
      const token = localStorage.getItem('accessToken')
      if (!token) return null
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return {
          id: payload.sub || payload.id || '',
          email: payload.email || '',
          role: (payload.role as 'admin' | 'editor' | 'viewer') || 'viewer',
          createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : new Date().toISOString(),
        }
      } catch {
        return null
      }
    },
    staleTime: Infinity,
  })
}

// Sites
export function useSites() {
  return useQuery({
    queryKey: ['sites'],
    queryFn: sitesApi.list,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSiteSettings(siteId: string | null) {
  return useQuery({
    queryKey: ['sites', siteId, 'settings'],
    queryFn: () => sitesApi.getSettings(siteId!),
    enabled: !!siteId,
    staleTime: 60 * 1000,
  })
}

export function useUpdateSiteSettings(siteId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof sitesApi.updateSettings>[1]) =>
      sitesApi.updateSettings(siteId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sites', siteId, 'settings'] })
      qc.invalidateQueries({ queryKey: ['sites'] })
    },
  })
}

export function useRotateApiKey(siteId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => sitesApi.rotateApiKey(siteId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sites', siteId, 'settings'] })
      qc.invalidateQueries({ queryKey: ['sites'] })
    },
  })
}

export function useMembers(siteId: string | null) {
  return useQuery({
    queryKey: ['sites', siteId, 'members'],
    queryFn: () => sitesApi.listMembers(siteId!),
    enabled: !!siteId,
    staleTime: 60 * 1000,
  })
}

export function useAddMember(siteId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      sitesApi.addMember(siteId!, email, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sites', siteId, 'members'] })
    },
  })
}

// Analytics
export function useRealtime(siteId: string | null) {
  return useQuery({
    queryKey: ['analytics', siteId, 'realtime'],
    queryFn: () => analyticsApi.realtime(siteId!),
    enabled: !!siteId,
    refetchInterval: 5000,
  })
}

export function useAggregate(siteId: string | null, from: string, to: string) {
  return useQuery({
    queryKey: ['analytics', siteId, 'aggregate', from, to],
    queryFn: () => analyticsApi.aggregate(siteId!, from, to),
    enabled: !!siteId,
    staleTime: 60 * 1000,
  })
}

export function useTimeseries(siteId: string | null, from: string, to: string) {
  return useQuery({
    queryKey: ['analytics', siteId, 'timeseries', from, to],
    queryFn: () => analyticsApi.timeseries(siteId!, from, to),
    enabled: !!siteId,
    staleTime: 60 * 1000,
  })
}

export function usePages(siteId: string | null, from: string, to: string, limit = 20) {
  return useQuery({
    queryKey: ['analytics', siteId, 'pages', from, to, limit],
    queryFn: () => analyticsApi.pages(siteId!, from, to, limit),
    enabled: !!siteId,
    staleTime: 60 * 1000,
  })
}

export function useReferrers(siteId: string | null, from: string, to: string, limit = 20) {
  return useQuery({
    queryKey: ['analytics', siteId, 'referrers', from, to, limit],
    queryFn: () => analyticsApi.referrers(siteId!, from, to, limit),
    enabled: !!siteId,
    staleTime: 60 * 1000,
  })
}

export function useMedia(siteId: string | null, from: string, to: string, limit = 20) {
  return useQuery({
    queryKey: ['analytics', siteId, 'media', from, to, limit],
    queryFn: () => analyticsApi.media(siteId!, from, to, limit),
    enabled: !!siteId,
    staleTime: 60 * 1000,
  })
}
