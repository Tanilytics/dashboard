import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

function DefaultNotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-bold">404</h1>
				<p className="mt-2 text-muted-foreground">Page not found</p>
			</div>
		</div>
	);
}

function DefaultError({ error }: { error: Error }) {
	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<div className="text-center max-w-md">
				<h1 className="text-2xl font-bold text-destructive mb-2">
					Something went wrong
				</h1>
				<p className="text-muted-foreground">{error.message}</p>
			</div>
		</div>
	);
}

export function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		routeTree,
		context,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: DefaultNotFound,
		defaultErrorComponent: DefaultError,
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
