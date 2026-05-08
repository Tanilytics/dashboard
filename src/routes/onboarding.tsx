import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "#/lib/auth-guards";
import OnboardingPage from "#/components/pages/OnboardingPage";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
  beforeLoad: requireAuth,
});
