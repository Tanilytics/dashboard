import type { TokenResponse, UserResponse, SiteResponse, Member, RealtimeStats, AggregateStats, TimeSeriesPoint, PageStats, ReferrerStats, MediaStats } from '#/types/api'

function resolveUrl(template: string | undefined, params: Record<string, string> = {}): string {
  if (!template) throw new Error(`Missing API endpoint URL for template`)
  return Object.entries(params).reduce((url, [key, value]) => {
    return url.replaceAll(`{${key}}`, encodeURIComponent(value))
  }, template)
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}: ${res.statusText}`)
    ;(error as any).status = res.status
    throw error
  }

  return res.json() as Promise<T>
}

export const authApi = {
  login: (email: string, password: string) =>
    fetchJson<TokenResponse>(resolveUrl(import.meta.env.VITE_API_AUTH_LOGIN_URL), {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    fetchJson<UserResponse>(resolveUrl(import.meta.env.VITE_API_AUTH_REGISTER_URL), {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    fetchJson<TokenResponse>(resolveUrl(import.meta.env.VITE_API_AUTH_REFRESH_URL), {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
}

export const sitesApi = {
  list: () => fetchJson<SiteResponse[]>(resolveUrl(import.meta.env.VITE_API_SITES_LIST_URL)),

  create: (name: string, domain: string) =>
    fetchJson<SiteResponse>(resolveUrl(import.meta.env.VITE_API_SITES_CREATE_URL), {
      method: 'POST',
      body: JSON.stringify({ name, domain }),
    }),

  getSettings: (siteId: string) =>
    fetchJson<SiteResponse>(resolveUrl(import.meta.env.VITE_API_SITES_SETTINGS_URL, { siteId })),

  updateSettings: (siteId: string, data: Partial<Pick<SiteResponse, 'settings' | 'retentionDays' | 'rateLimitRps'>>) =>
    fetchJson<SiteResponse>(resolveUrl(import.meta.env.VITE_API_SITES_SETTINGS_URL, { siteId }), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  rotateApiKey: (siteId: string) =>
    fetchJson<SiteResponse>(resolveUrl(import.meta.env.VITE_API_SITES_API_KEY_ROTATE_URL, { siteId }), {
      method: 'POST',
    }),

  listMembers: (siteId: string) =>
    fetchJson<Member[]>(resolveUrl(import.meta.env.VITE_API_SITES_MEMBERS_URL, { siteId })),

  addMember: (siteId: string, email: string, role: string) =>
    fetchJson<Member>(resolveUrl(import.meta.env.VITE_API_SITES_MEMBERS_URL, { siteId }), {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),
}

export const analyticsApi = {
  realtime: (siteId: string) =>
    fetchJson<RealtimeStats>(resolveUrl(import.meta.env.VITE_API_ANALYTICS_REALTIME_URL, { siteId })),

  aggregate: (siteId: string, from: string, to: string) =>
    fetchJson<AggregateStats>(
      `${resolveUrl(import.meta.env.VITE_API_ANALYTICS_AGGREGATE_URL, { siteId })}?from=${from}&to=${to}`,
    ),

  timeseries: (siteId: string, from: string, to: string) =>
    fetchJson<TimeSeriesPoint[]>(
      `${resolveUrl(import.meta.env.VITE_API_ANALYTICS_TIMESERIES_URL, { siteId })}?from=${from}&to=${to}`,
    ),

  pages: (siteId: string, from: string, to: string, limit = 20) =>
    fetchJson<PageStats[]>(
      `${resolveUrl(import.meta.env.VITE_API_ANALYTICS_PAGES_URL, { siteId })}?from=${from}&to=${to}&limit=${limit}`,
    ),

  referrers: (siteId: string, from: string, to: string, limit = 20) =>
    fetchJson<ReferrerStats[]>(
      `${resolveUrl(import.meta.env.VITE_API_ANALYTICS_REFERRERS_URL, { siteId })}?from=${from}&to=${to}&limit=${limit}`,
    ),

  media: (siteId: string, from: string, to: string, limit = 20) =>
    fetchJson<MediaStats[]>(
      `${resolveUrl(import.meta.env.VITE_API_ANALYTICS_MEDIA_URL, { siteId })}?from=${from}&to=${to}&limit=${limit}`,
    ),

  streamUrl: (siteId: string) => resolveUrl(import.meta.env.VITE_API_ANALYTICS_STREAM_URL, { siteId }),
}
