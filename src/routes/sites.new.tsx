import { createFileRoute } from "@tanstack/react-router";
import CreateSitePage from "#/components/pages/CreateSitePage";
import { requireAuth } from "#/lib/auth-guards";

export const Route = createFileRoute("/sites/new")({
	component: CreateSitePage,
	beforeLoad: requireAuth,
});
