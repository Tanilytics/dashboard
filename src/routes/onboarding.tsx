import { createFileRoute } from "@tanstack/react-router";
import OnboardingPage from "#/components/pages/OnboardingPage";
import { requireAuth } from "#/lib/auth-guards";

export const Route = createFileRoute("/onboarding")({
	component: OnboardingPage,
	beforeLoad: requireAuth,
});
