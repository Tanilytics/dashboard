import { useNavigate } from "@tanstack/react-router";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { useSites, useUser } from "#/lib/queries";
import type { SiteResponse, UserResponse } from "#/types/api";

export const userAtom = atom<UserResponse | null>(null);
export const sitesAtom = atom<SiteResponse[]>([]);
export const currentSiteIdAtom = atom<string | null>(null);
export const isLoadingAtom = atom(false);

const logoutAtom = atom(null, (_get, set) => {
	set(userAtom, null);
	set(sitesAtom, []);
	set(currentSiteIdAtom, null);
	if (typeof window !== "undefined") {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
	}
});

export function useAuth() {
	const navigate = useNavigate();
	const [user, setUser] = useAtom(userAtom);
	const [sites, setSites] = useAtom(sitesAtom);
	const [currentSiteId, setCurrentSiteId] = useAtom(currentSiteIdAtom);
	const isLoading = useAtomValue(isLoadingAtom);
	const clearAuth = useSetAtom(logoutAtom);

	const userQuery = useUser();
	const sitesQuery = useSites();

	// Sync query data into Jotai atoms only when meaningful
	useEffect(() => {
		if (userQuery.data?.email) {
			setUser(userQuery.data);
		}
	}, [userQuery.data, setUser]);

	useEffect(() => {
		if (sitesQuery.data) {
			setSites(sitesQuery.data);
			const valid = sitesQuery.data.find((s) => s.id === currentSiteId);
			if (!valid && sitesQuery.data.length > 0) {
				setCurrentSiteId(sitesQuery.data[0].id);
			}
		}
	}, [sitesQuery.data, setSites, currentSiteId, setCurrentSiteId]);

	const logout = () => {
		clearAuth();
		navigate({ to: "/login" });
	};

	return {
		user,
		sites,
		currentSiteId,
		isLoading: isLoading || userQuery.isLoading || sitesQuery.isLoading,
		setUser,
		setSites,
		setCurrentSiteId,
		logout,
	};
}
