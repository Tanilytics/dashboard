import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  getSessionData,
  requireAuth,
} from '#/lib/session.server'
import {
  ApiError,
} from '#/lib/errors'
import {
  loginSchema,
  registerSchema,
  createSiteSchema,
} from '#/lib/schemas'
import type {
  TokenResponse,
  UserResponse,
  SiteResponse,
  Member,
  RealtimeStats,
  AggregateStats,
  TimeSeriesPoint,
  PageStats,
  ReferrerStats,
  MediaStats,
} from '#/types/api'

// ------------------------------------------------------------------
// Server-only env helpers
// ------------------------------------------------------------------

function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing environment variable: ${key}`)
  return value
}

// ------------------------------------------------------------------
// Upstream API helpers (server-only)
// ------------------------------------------------------------------

function resolveUrl(template: string, params: Record<string, string> = {}): string {
  return Object.entries(params).reduce((url, [key, value]) => {
    return url.replaceAll(`{${key}}`, encodeURIComponent(value))
  }, template)
}

async function upstreamFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    let body: any
    try {
      body = await res.json()
    } catch {
      body = undefined
    }
    const message = body?.detail || `HTTP ${res.status}: ${res.statusText}`
    throw new ApiError(message, res.status, body?.title || 'UPSTREAM_ERROR')
  }

  return res.json() as Promise<T>
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getSessionData()
  const token = session.data.tokens?.accessToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ------------------------------------------------------------------
// Auth
// ------------------------------------------------------------------

export const login = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const loginUrl = getEnv('VITE_API_AUTH_LOGIN_URL')

    const tokens = await upstreamFetch<TokenResponse>(loginUrl, {
      method: 'POST',
      body: JSON.stringify({ email: data.email, password: data.password }),
    })

    const session = await getSessionData()
    await session.update({
      tokens,
      user: {
        id: '',
        email: data.email,
        role: 'admin' as const,
        createdAt: new Date().toISOString(),
      },
    })

    return { success: true }
  })

export const register = createServerFn({ method: 'POST' })
  .inputValidator(registerSchema)
  .handler(async ({ data }) => {
    const registerUrl = getEnv('VITE_API_AUTH_REGISTER_URL')
    const loginUrl = getEnv('VITE_API_AUTH_LOGIN_URL')

    const user = await upstreamFetch<UserResponse>(registerUrl, {
      method: 'POST',
      body: JSON.stringify({ email: data.email, password: data.password }),
    })

    const tokens = await upstreamFetch<TokenResponse>(loginUrl, {
      method: 'POST',
      body: JSON.stringify({ email: data.email, password: data.password }),
    })

    const session = await getSessionData()
    await session.update({ tokens, user })

    return { success: true, user }
  })

export const logout = createServerFn({ method: 'POST' })
  .handler(async () => {
    const session = await getSessionData()
    await session.update({ user: null, tokens: null })
    return { success: true }
  })

export const getCurrentUser = createServerFn()
  .handler(async () => {
    const session = await getSessionData()
    return session.data.user ?? null
  })

// ------------------------------------------------------------------
// Sites
// ------------------------------------------------------------------

const siteIdSchema = z.object({ siteId: z.string().min(1) })

export const listSites = createServerFn()
  .handler(async () => {
    await requireAuth()
    const url = getEnv('VITE_API_SITES_LIST_URL')
    return upstreamFetch<SiteResponse[]>(url, {
      headers: await getAuthHeaders(),
    })
  })

export const createSite = createServerFn({ method: 'POST' })
  .inputValidator(createSiteSchema)
  .handler(async ({ data }) => {
    const url = getEnv('VITE_API_SITES_CREATE_URL')
    return upstreamFetch<SiteResponse>(url, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    })
  })

export const getSiteSettings = createServerFn()
  .inputValidator(siteIdSchema)
  .handler(async ({ data }) => {
    const url = getEnv('VITE_API_SITES_SETTINGS_URL')
    return upstreamFetch<SiteResponse>(resolveUrl(url, { siteId: data.siteId }), {
      headers: await getAuthHeaders(),
    })
  })

const updateSiteSettingsSchema = z.object({
  siteId: z.string().min(1),
  settings: z.record(z.string(), z.any()).optional(),
  retentionDays: z.number().int().min(30).optional(),
  rateLimitRps: z.number().int().min(1).optional(),
})

export const updateSiteSettings = createServerFn({ method: 'POST' })
  .inputValidator(updateSiteSettingsSchema)
  .handler(async ({ data }) => {
    const { siteId, ...rest } = data
    const url = getEnv('VITE_API_SITES_SETTINGS_URL')
    return upstreamFetch<SiteResponse>(resolveUrl(url, { siteId }), {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(rest),
    })
  })

export const rotateApiKey = createServerFn({ method: 'POST' })
  .inputValidator(siteIdSchema)
  .handler(async ({ data }) => {
    const url = getEnv('VITE_API_SITES_API_KEY_ROTATE_URL')
    return upstreamFetch<SiteResponse>(resolveUrl(url, { siteId: data.siteId }), {
      method: 'POST',
      headers: await getAuthHeaders(),
    })
  })

export const listMembers = createServerFn()
  .inputValidator(siteIdSchema)
  .handler(async ({ data }) => {
    const url = getEnv('VITE_API_SITES_MEMBERS_URL')
    return upstreamFetch<Member[]>(resolveUrl(url, { siteId: data.siteId }), {
      headers: await getAuthHeaders(),
    })
  })

const addMemberPayloadSchema = z.object({
  siteId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']),
})

export const addMember = createServerFn({ method: 'POST' })
  .inputValidator(addMemberPayloadSchema)
  .handler(async ({ data }) => {
    const { siteId, email, role } = data
    const url = getEnv('VITE_API_SITES_MEMBERS_URL')
    return upstreamFetch<Member>(resolveUrl(url, { siteId }), {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ email, role }),
    })
  })

// ------------------------------------------------------------------
// Analytics
// ------------------------------------------------------------------

const analyticsRangeSchema = z.object({
  siteId: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  limit: z.number().int().min(1).max(1000).optional(),
})

export const getRealtime = createServerFn()
  .inputValidator(siteIdSchema)
  .handler(async ({ data }) => {
    const url = getEnv('VITE_API_ANALYTICS_REALTIME_URL')
    return upstreamFetch<RealtimeStats>(resolveUrl(url, { siteId: data.siteId }), {
      headers: await getAuthHeaders(),
    })
  })

export const getAggregate = createServerFn()
  .inputValidator(analyticsRangeSchema)
  .handler(async ({ data }) => {
    const template = getEnv('VITE_API_ANALYTICS_AGGREGATE_URL')
    const url = new URL(resolveUrl(template, { siteId: data.siteId }))
    url.searchParams.set('from', data.from)
    url.searchParams.set('to', data.to)

    return upstreamFetch<AggregateStats>(url.toString(), {
      headers: await getAuthHeaders(),
    })
  })

export const getTimeseries = createServerFn()
  .inputValidator(analyticsRangeSchema)
  .handler(async ({ data }) => {
    const template = getEnv('VITE_API_ANALYTICS_TIMESERIES_URL')
    const url = new URL(resolveUrl(template, { siteId: data.siteId }))
    url.searchParams.set('from', data.from)
    url.searchParams.set('to', data.to)

    return upstreamFetch<TimeSeriesPoint[]>(url.toString(), {
      headers: await getAuthHeaders(),
    })
  })

export const getPages = createServerFn()
  .inputValidator(analyticsRangeSchema)
  .handler(async ({ data }) => {
    const template = getEnv('VITE_API_ANALYTICS_PAGES_URL')
    const url = new URL(resolveUrl(template, { siteId: data.siteId }))
    url.searchParams.set('from', data.from)
    url.searchParams.set('to', data.to)
    if (data.limit) url.searchParams.set('limit', String(data.limit))

    return upstreamFetch<PageStats[]>(url.toString(), {
      headers: await getAuthHeaders(),
    })
  })

export const getReferrers = createServerFn()
  .inputValidator(analyticsRangeSchema)
  .handler(async ({ data }) => {
    const template = getEnv('VITE_API_ANALYTICS_REFERRERS_URL')
    const url = new URL(resolveUrl(template, { siteId: data.siteId }))
    url.searchParams.set('from', data.from)
    url.searchParams.set('to', data.to)
    if (data.limit) url.searchParams.set('limit', String(data.limit))

    return upstreamFetch<ReferrerStats[]>(url.toString(), {
      headers: await getAuthHeaders(),
    })
  })

export const getMedia = createServerFn()
  .inputValidator(analyticsRangeSchema)
  .handler(async ({ data }) => {
    const template = getEnv('VITE_API_ANALYTICS_MEDIA_URL')
    const url = new URL(resolveUrl(template, { siteId: data.siteId }))
    url.searchParams.set('from', data.from)
    url.searchParams.set('to', data.to)
    if (data.limit) url.searchParams.set('limit', String(data.limit))

    return upstreamFetch<MediaStats[]>(url.toString(), {
      headers: await getAuthHeaders(),
    })
  })

export const getStreamConfig = createServerFn()
  .inputValidator(siteIdSchema)
  .handler(async ({ data }) => {
    const template = getEnv('VITE_API_ANALYTICS_STREAM_URL')
    const session = await getSessionData()
    return {
      url: resolveUrl(template, { siteId: data.siteId }),
      token: session.data.tokens?.accessToken ?? '',
    }
  })
