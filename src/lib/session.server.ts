import { useSession } from "@tanstack/react-start/server";
import type { UserResponse } from "#/types/api";

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
	if (process.env.NODE_ENV === "production") {
		throw new Error(
			"SESSION_SECRET must be defined and at least 32 characters long in production.",
		);
	}
	console.warn(
		"SESSION_SECRET is not defined or is too short (< 32 chars). Using a fallback for development only.",
	);
}

const sessionConfig = {
	password: SESSION_SECRET || "fallback-dev-secret-do-not-use-in-production-32",
	name: "__session",
	cookie: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		maxAge: 60 * 60 * 24 * 7, // 7 days
		path: "/",
	},
};

export async function getSessionData() {
	const session = await useSession<{
		user: UserResponse | null;
		tokens: { accessToken: string; refreshToken: string } | null;
	}>(sessionConfig);
	return session;
}

export async function requireAuth() {
	const session = await getSessionData();
	const user = session.data.user;
	if (!user) {
		throw new Error("Unauthorized");
	}
	return { session, user };
}
