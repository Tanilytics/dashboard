import { z } from "zod";

const serverEnvSchema = z.object({
	SESSION_SECRET: z.string().min(32),

	// Auth API endpoints
	VITE_API_AUTH_LOGIN_URL: z.url(),
	VITE_API_AUTH_REGISTER_URL: z.url(),
	VITE_API_AUTH_REFRESH_URL: z.url(),
	VITE_API_AUTH_ME_URL: z.url().optional(),

	// Sites API endpoints
	VITE_API_SITES_LIST_URL: z.url(),
	VITE_API_SITES_CREATE_URL: z.url(),
	VITE_API_SITES_SETTINGS_URL: z.url(),
	VITE_API_SITES_API_KEY_ROTATE_URL: z.url(),
	VITE_API_SITES_MEMBERS_URL: z.url(),

	// Analytics API endpoints
	VITE_API_ANALYTICS_REALTIME_URL: z.url(),
	VITE_API_ANALYTICS_AGGREGATE_URL: z.url(),
	VITE_API_ANALYTICS_TIMESERIES_URL: z.url(),
	VITE_API_ANALYTICS_PAGES_URL: z.url(),
	VITE_API_ANALYTICS_REFERRERS_URL: z.url(),
	VITE_API_ANALYTICS_MEDIA_URL: z.url(),
	VITE_API_ANALYTICS_STREAM_URL: z.url(),

	// Optional
	VITE_SENTRY_DSN: z.url().optional(),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("Invalid server environment variables:");
	const tree = z.treeifyError(parsed.error);
	console.error(tree);
	throw new Error("Invalid server environment configuration");
}

export const serverEnv = parsed.data;
