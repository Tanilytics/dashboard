import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "#/components/layout/dashboard-layout";
import { listSites } from "#/lib/api.functions";
import { requireAuth } from "#/lib/auth-guards";

export const Route = createFileRoute("/dashboard")({
	component: DashboardLayout,
	beforeLoad: requireAuth,
	loader: async ({ context }) => {
		const { queryClient } = context;
		await queryClient.prefetchQuery({
			queryKey: ["sites"],
			queryFn: () => listSites(),
		});
	},
});
