import { ApiError } from "./errors";

export function resolveUrl(
	template: string,
	params: Record<string, string> = {},
): string {
	return Object.entries(params).reduce((url, [key, value]) => {
		return url.replaceAll(`{${key}}`, encodeURIComponent(value));
	}, template);
}

export async function upstreamFetch<T>(
	url: string,
	options?: RequestInit,
): Promise<T> {
	const res = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});

	if (!res.ok) {
		let body: any;
		try {
			body = await res.json();
		} catch {
			body = undefined;
		}
		const message = body?.detail || `HTTP ${res.status}: ${res.statusText}`;
		throw new ApiError(message, res.status, body?.title || "UPSTREAM_ERROR");
	}

	return res.json() as Promise<T>;
}
