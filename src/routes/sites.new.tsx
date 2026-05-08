import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "#/lib/auth-guards";
import CreateSitePage from "#/components/pages/CreateSitePage";

export const Route = createFileRoute("/sites/new")({
  component: CreateSitePage,
  beforeLoad: requireAuth,
});
