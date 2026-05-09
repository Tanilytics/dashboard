import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { getCurrentUser } from "#/lib/api.functions";

export async function redirectIfAuth({
	context,
}: {
	context: { queryClient: QueryClient };
}) {
	const user = await getCurrentUser();
	if (user) {
		context.queryClient.setQueryData(["auth", "user"], user);
		throw redirect({ to: "/dashboard" });
	}
}

export async function requireAuth({
	context,
	location,
}: {
	context: { queryClient: QueryClient };
	location: { href: string };
}) {
	const user = await getCurrentUser();
	if (!user) {
		throw redirect({ to: "/login", search: { redirect: location.href } });
	}
	context.queryClient.setQueryData(["auth", "user"], user);
	return { user };
}
