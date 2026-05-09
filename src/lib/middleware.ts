import { createMiddleware } from "@tanstack/react-start";
import { getSessionData } from "./session.server";

export const withAuth = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const session = await getSessionData();
		const user = session.data.user;
		if (!user) {
			throw new Error("Unauthorized");
		}
		return next({ context: { user } });
	},
);

export const withAuthHeaders = createMiddleware({ type: "function" })
	.middleware([withAuth])
	.server(async ({ next, context }) => {
		const session = await getSessionData();
		const token = session.data.tokens?.accessToken;
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		return next({ context: { ...context, authHeaders: headers } });
	});
