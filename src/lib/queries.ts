import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addMember,
	getAggregate,
	getCurrentUser,
	getMedia,
	getPages,
	getRealtime,
	getReferrers,
	getSiteSettings,
	getTimeseries,
	listMembers,
	listSites,
	rotateApiKey,
	updateSiteSettings,
} from "#/lib/api.functions";

function toHourISO(d: Date): string {
	d.setMinutes(0, 0, 0);
	return d.toISOString();
}

export function getLast7Days(): { from: string; to: string } {
	const to = toHourISO(new Date());
	const from = toHourISO(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
	return { from, to };
}

export function getLast30Days(): { from: string; to: string } {
	const to = toHourISO(new Date());
	const from = toHourISO(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
	return { from, to };
}

export function getDateRange(range: string): { from: string; to: string } {
	const to = toHourISO(new Date());
	let ms = 7 * 24 * 60 * 60 * 1000;
	switch (range) {
		case "24h":
			ms = 24 * 60 * 60 * 1000;
			break;
		case "7d":
			ms = 7 * 24 * 60 * 60 * 1000;
			break;
		case "30d":
			ms = 30 * 24 * 60 * 60 * 1000;
			break;
		case "90d":
			ms = 90 * 24 * 60 * 60 * 1000;
			break;
	}
	const from = toHourISO(new Date(Date.now() - ms));
	return { from, to };
}

// Auth
export function useUser() {
	return useQuery({
		queryKey: ["auth", "user"],
		queryFn: () => getCurrentUser(),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: true,
		retry: false,
	});
}

// Sites
export function useSites() {
	return useQuery({
		queryKey: ["sites"],
		queryFn: () => listSites(),
		staleTime: 5 * 60 * 1000,
	});
}

export function useSiteSettings(siteId: string | null) {
	return useQuery({
		queryKey: ["sites", siteId, "settings"],
		queryFn: () => getSiteSettings({ data: { siteId: siteId! } }),
		enabled: !!siteId,
		staleTime: 60 * 1000,
	});
}

export function useUpdateSiteSettings(siteId: string | null) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (
			data: Omit<Parameters<typeof updateSiteSettings>[0]["data"], "siteId">,
		) => updateSiteSettings({ data: { siteId: siteId!, ...data } }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["sites", siteId, "settings"] });
			qc.invalidateQueries({ queryKey: ["sites"] });
		},
	});
}

export function useRotateApiKey(siteId: string | null) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => rotateApiKey({ data: { siteId: siteId! } }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["sites", siteId, "settings"] });
			qc.invalidateQueries({ queryKey: ["sites"] });
		},
	});
}

export function useMembers(siteId: string | null) {
	return useQuery({
		queryKey: ["sites", siteId, "members"],
		queryFn: () => listMembers({ data: { siteId: siteId! } }),
		enabled: !!siteId,
		staleTime: 60 * 1000,
	});
}

export function useAddMember(siteId: string | null) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			email,
			role,
		}: {
			email: string;
			role: "admin" | "editor" | "viewer";
		}) => addMember({ data: { siteId: siteId!, email, role } }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["sites", siteId, "members"] });
		},
	});
}

// Analytics
export function useRealtime(siteId: string | null) {
	return useQuery({
		queryKey: ["analytics", siteId, "realtime"],
		queryFn: () => getRealtime({ data: { siteId: siteId! } }),
		enabled: !!siteId,
		refetchInterval: 5000,
	});
}

export function useAggregate(siteId: string | null, from: string, to: string) {
	return useQuery({
		queryKey: ["analytics", siteId, "aggregate", from, to],
		queryFn: () => getAggregate({ data: { siteId: siteId!, from, to } }),
		enabled: !!siteId,
		staleTime: 60 * 1000,
	});
}

export function useTimeseries(siteId: string | null, from: string, to: string) {
	return useQuery({
		queryKey: ["analytics", siteId, "timeseries", from, to],
		queryFn: () => getTimeseries({ data: { siteId: siteId!, from, to } }),
		enabled: !!siteId,
		staleTime: 60 * 1000,
	});
}

export function usePages(
	siteId: string | null,
	from: string,
	to: string,
	limit = 20,
) {
	return useQuery({
		queryKey: ["analytics", siteId, "pages", from, to, limit],
		queryFn: () => getPages({ data: { siteId: siteId!, from, to, limit } }),
		enabled: !!siteId,
		staleTime: 60 * 1000,
	});
}

export function useReferrers(
	siteId: string | null,
	from: string,
	to: string,
	limit = 20,
) {
	return useQuery({
		queryKey: ["analytics", siteId, "referrers", from, to, limit],
		queryFn: () => getReferrers({ data: { siteId: siteId!, from, to, limit } }),
		enabled: !!siteId,
		staleTime: 60 * 1000,
	});
}

export function useMedia(
	siteId: string | null,
	from: string,
	to: string,
	limit = 20,
) {
	return useQuery({
		queryKey: ["analytics", siteId, "media", from, to, limit],
		queryFn: () => getMedia({ data: { siteId: siteId!, from, to, limit } }),
		enabled: !!siteId,
		staleTime: 60 * 1000,
	});
}
