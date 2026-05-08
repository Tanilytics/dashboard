import { redirect } from "@tanstack/react-router";
import { getCurrentUser } from "#/lib/api.functions";

export async function redirectIfAuth() {
  const user = await getCurrentUser();
  if (user) {
    throw redirect({ to: "/dashboard" });
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw redirect({ to: "/login" });
  }
  return { user };
}
