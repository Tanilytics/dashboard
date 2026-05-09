import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { resolveUrl, upstreamFetch } from "#/lib/api.server";
import { serverEnv } from "#/lib/env.server";
import { withAuth } from "#/lib/middleware";
import {
	createSiteSchema,
	loginSchema,
	registerInputSchema,
} from "#/lib/schemas";
import { getSessionData } from "#/lib/session.server";
import type {
	AggregateStats,
	MediaStats,
	Member,
	PageStats,
	RealtimeStats,
	ReferrerStats,
	SiteResponse,
	TimeSeriesPoint,
	TokenResponse,
	UserResponse,
} from "#/types/api";

// ------------------------------------------------------------------
// Auth
// ------------------------------------------------------------------

export const login = createServerFn({ method: "POST" })
	.inputValidator(loginSchema)
	.handler(async ({ data }) => {
		const loginUrl = serverEnv.VITE_API_AUTH_LOGIN_URL;

		const tokens = await upstreamFetch<TokenResponse>(loginUrl, {
			method: "POST",
			body: JSON.stringify({ email: data.email, password: data.password }),
		});

		const session = await getSessionData();
		await session.update({
			tokens,
			user: {
				id: "",
				email: data.email,
				role: "admin" as const,
				createdAt: new Date().toISOString(),
			},
		});

		return { success: true };
	});

export const register = createServerFn({ method: "POST" })
	.inputValidator(registerInputSchema)
	.handler(async ({ data }) => {
		const registerUrl = serverEnv.VITE_API_AUTH_REGISTER_URL;
		const loginUrl = serverEnv.VITE_API_AUTH_LOGIN_URL;

		const user = await upstreamFetch<UserResponse>(registerUrl, {
			method: "POST",
			body: JSON.stringify({ email: data.email, password: data.password }),
		});

		const tokens = await upstreamFetch<TokenResponse>(loginUrl, {
			method: "POST",
			body: JSON.stringify({ email: data.email, password: data.password }),
		});

		const session = await getSessionData();
		await session.update({ tokens, user });

		return { success: true, user };
	});

export const logout = createServerFn({ method: "POST" }).handler(async () => {
	const session = await getSessionData();
	await session.clear();
	throw redirect({ to: "/login" });
});

export const getCurrentUser = createServerFn().handler(async () => {
	const session = await getSessionData();
	const user = session.data.user;
	if (!user) return null;

	// If a /me endpoint is configured, validate the token live
	const meUrl = serverEnv.VITE_API_AUTH_ME_URL;
	if (meUrl) {
		const token = session.data.tokens?.accessToken;
		if (!token) {
			await session.clear();
			return null;
		}
		try {
			return await upstreamFetch<UserResponse>(meUrl, {
				headers: { Authorization: `Bearer ${token}` },
			});
		} catch {
			await session.clear();
			return null;
		}
	}

	return user;
});

// ------------------------------------------------------------------
// Sites
// ------------------------------------------------------------------

const siteIdSchema = z.object({ siteId: z.string().min(1) });

export const listSites = createServerFn()
	.middleware([withAuth])
	.handler(async () => {
		const url = serverEnv.VITE_API_SITES_LIST_URL;
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;
		return upstreamFetch<SiteResponse[]>(url, {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
	});

export const createSite = createServerFn({ method: "POST" })
	.middleware([withAuth])
	.inputValidator(createSiteSchema)
	.handler(async ({ data }) => {
		const url = serverEnv.VITE_API_SITES_CREATE_URL;
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;
		return upstreamFetch<SiteResponse>(url, {
			method: "POST",
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			body: JSON.stringify(data),
		});
	});

export const getSiteSettings = createServerFn()
	.middleware([withAuth])
	.inputValidator(siteIdSchema)
	.handler(async ({ data }) => {
		const url = serverEnv.VITE_API_SITES_SETTINGS_URL;
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;
		return upstreamFetch<SiteResponse>(
			resolveUrl(url, { siteId: data.siteId }),
			{
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			},
		);
	});

const updateSiteSettingsSchema = z.object({
	siteId: z.string().min(1),
	settings: z.record(z.string(), z.any()).optional(),
	retentionDays: z.number().int().min(30).optional(),
	rateLimitRps: z.number().int().min(1).optional(),
});

export const updateSiteSettings = createServerFn({ method: "POST" })
	.middleware([withAuth])
	.inputValidator(updateSiteSettingsSchema)
	.handler(async ({ data }) => {
		const { siteId, ...rest } = data;
		const url = serverEnv.VITE_API_SITES_SETTINGS_URL;
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;
		return upstreamFetch<SiteResponse>(resolveUrl(url, { siteId }), {
			method: "PUT",
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			body: JSON.stringify(rest),
		});
	});

export const rotateApiKey = createServerFn({ method: "POST" })
	.middleware([withAuth])
	.inputValidator(siteIdSchema)
	.handler(async ({ data }) => {
		const url = serverEnv.VITE_API_SITES_API_KEY_ROTATE_URL;
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;
		return upstreamFetch<SiteResponse>(
			resolveUrl(url, { siteId: data.siteId }),
			{
				method: "POST",
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			},
		);
	});

export const listMembers = createServerFn()
	.middleware([withAuth])
	.inputValidator(siteIdSchema)
	.handler(async ({ data }) => {
		const url = serverEnv.VITE_API_SITES_MEMBERS_URL;
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;
		return upstreamFetch<Member[]>(resolveUrl(url, { siteId: data.siteId }), {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
	});

const addMemberPayloadSchema = z.object({
	siteId: z.string().min(1),
	email: z.email(),
	role: z.enum(["admin", "editor", "viewer"]),
});

export const addMember = createServerFn({ method: "POST" })
	.middleware([withAuth])
	.inputValidator(addMemberPayloadSchema)
	.handler(async ({ data }) => {
		const { siteId, email, role } = data;
		const url = serverEnv.VITE_API_SITES_MEMBERS_URL;
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;
		return upstreamFetch<Member>(resolveUrl(url, { siteId }), {
			method: "POST",
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			body: JSON.stringify({ email, role }),
		});
	});

// ------------------------------------------------------------------
// Analytics
// ------------------------------------------------------------------

const analyticsRangeSchema = z.object({
	siteId: z.string().min(1),
	from: z.string().min(1),
	to: z.string().min(1),
	limit: z.number().int().min(1).max(1000).optional(),
});

export const getRealtime = createServerFn()
	.middleware([withAuth])
	.inputValidator(siteIdSchema)
	.handler(async ({ data }) => {
		const url = serverEnv.VITE_API_ANALYTICS_REALTIME_URL;
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;
		return upstreamFetch<RealtimeStats>(
			resolveUrl(url, { siteId: data.siteId }),
			{
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			},
		);
	});

export const getAggregate = createServerFn()
	.middleware([withAuth])
	.inputValidator(analyticsRangeSchema)
	.handler(async ({ data }) => {
		const template = serverEnv.VITE_API_ANALYTICS_AGGREGATE_URL;
		const url = new URL(resolveUrl(template, { siteId: data.siteId }));
		url.searchParams.set("from", data.from);
		url.searchParams.set("to", data.to);
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;

		return upstreamFetch<AggregateStats>(url.toString(), {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
	});

export const getTimeseries = createServerFn()
	.middleware([withAuth])
	.inputValidator(analyticsRangeSchema)
	.handler(async ({ data }) => {
		const template = serverEnv.VITE_API_ANALYTICS_TIMESERIES_URL;
		const url = new URL(resolveUrl(template, { siteId: data.siteId }));
		url.searchParams.set("from", data.from);
		url.searchParams.set("to", data.to);
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;

		return upstreamFetch<TimeSeriesPoint[]>(url.toString(), {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
	});

export const getPages = createServerFn()
	.middleware([withAuth])
	.inputValidator(analyticsRangeSchema)
	.handler(async ({ data }) => {
		const template = serverEnv.VITE_API_ANALYTICS_PAGES_URL;
		const url = new URL(resolveUrl(template, { siteId: data.siteId }));
		url.searchParams.set("from", data.from);
		url.searchParams.set("to", data.to);
		if (data.limit) url.searchParams.set("limit", String(data.limit));
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;

		return upstreamFetch<PageStats[]>(url.toString(), {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
	});

export const getReferrers = createServerFn()
	.middleware([withAuth])
	.inputValidator(analyticsRangeSchema)
	.handler(async ({ data }) => {
		const template = serverEnv.VITE_API_ANALYTICS_REFERRERS_URL;
		const url = new URL(resolveUrl(template, { siteId: data.siteId }));
		url.searchParams.set("from", data.from);
		url.searchParams.set("to", data.to);
		if (data.limit) url.searchParams.set("limit", String(data.limit));
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;

		return upstreamFetch<ReferrerStats[]>(url.toString(), {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
	});

export const getMedia = createServerFn()
	.middleware([withAuth])
	.inputValidator(analyticsRangeSchema)
	.handler(async ({ data }) => {
		const template = serverEnv.VITE_API_ANALYTICS_MEDIA_URL;
		const url = new URL(resolveUrl(template, { siteId: data.siteId }));
		url.searchParams.set("from", data.from);
		url.searchParams.set("to", data.to);
		if (data.limit) url.searchParams.set("limit", String(data.limit));
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;

		return upstreamFetch<MediaStats[]>(url.toString(), {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
	});

export const getStreamConfig = createServerFn()
	.middleware([withAuth])
	.inputValidator(siteIdSchema)
	.handler(async ({ data }) => {
		const template = serverEnv.VITE_API_ANALYTICS_STREAM_URL;
		const session = await getSessionData();
		return {
			url: resolveUrl(template, { siteId: data.siteId }),
			token: session.data.tokens?.accessToken ?? "",
		};
	});
