import { useNavigate } from "@tanstack/react-router";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { logout as logoutFn } from "#/lib/api.functions";
import { useSites, useUser } from "#/lib/queries";

export const currentSiteIdAtom = atom<string | null>(null);
export const dateRangeAtom = atom<string>("7d");

export function useAuth() {
	const navigate = useNavigate();
	const [currentSiteId, setCurrentSiteId] = useAtom(currentSiteIdAtom);
	const [dateRange, setDateRange] = useAtom(dateRangeAtom);

	const userQuery = useUser();
	const sitesQuery = useSites();

	// Auto-select first site when sites load
	useEffect(() => {
		if (sitesQuery.data) {
			const valid = sitesQuery.data.find((s) => s.id === currentSiteId);
			if (!valid && sitesQuery.data.length > 0) {
				setCurrentSiteId(sitesQuery.data[0].id);
			}
		}
	}, [sitesQuery.data, currentSiteId, setCurrentSiteId]);

	const logout = async () => {
		await logoutFn();
		navigate({ to: "/login" });
	};

	return {
		user: userQuery.data ?? null,
		sites: sitesQuery.data ?? [],
		currentSiteId,
		dateRange,
		isLoading: userQuery.isLoading || sitesQuery.isLoading,
		setCurrentSiteId,
		setDateRange,
		logout,
	};
}
