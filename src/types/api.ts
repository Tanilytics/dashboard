export interface TokenResponse {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface UserResponse {
	id: string;
	email: string;
	role: "admin" | "editor" | "viewer";
	createdAt: string;
}

export interface SiteResponse {
	id: string;
	name: string;
	domain: string;
	apiKey: string;
	settings: Record<string, any>;
	retentionDays: number;
	rateLimitRps: number;
	createdAt: string;
}

export interface Member {
	userId: string;
	email: string;
	role: "admin" | "editor" | "viewer";
}

export interface RealtimeStats {
	activeUsers: number;
	pageViewsCurrentHour: number;
	uniqueVisitorsCurrentHour: number;
	concurrentMediaViewers: number;
}

export interface AggregateStats {
	pageViews: number;
	uniqueVisitors: number;
	uniqueSessions: number;
	bounceRate: number;
	avgSessionDurationSeconds: number;
}

export interface TimeSeriesPoint {
	bucket: string;
	pageViews: number;
	uniqueVisitors: number;
}

export interface PageStats {
	url: string;
	views: number;
	uniqueVisitors: number;
	uniqueSessions: number;
	avgTimeOnPageSeconds: number;
}

export interface ReferrerStats {
	referrer: string;
	visits: number;
	uniqueVisitors: number;
}

export interface MediaStats {
	mediaUrl: string;
	mediaType: "video" | "audio";
	plays: number;
	completions: number;
	uniqueViewers: number;
	avgCompletionRate: number;
}
