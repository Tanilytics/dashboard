import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { sitesApi } from "#/lib/api";
import { useAuth } from "#/hooks/use-auth";
import type { SiteResponse } from "#/types/api";

function requireAuth() {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("accessToken");
		if (!token) {
			throw redirect({ to: "/login" });
		}
	}
}

export const Route = createFileRoute("/sites/new")({
	component: CreateSitePage,
	beforeLoad: requireAuth,
});

function CreateSiteForm({ onCreated }: { onCreated: (site: SiteResponse) => void }) {
	const qc = useQueryClient();
	const { setCurrentSiteId } = useAuth();
	const [name, setName] = useState("");
	const [domain, setDomain] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !domain) return;
		setIsLoading(true);
		try {
			const site = await sitesApi.create(name, domain);
			setCurrentSiteId(site.id);
			qc.invalidateQueries({ queryKey: ["sites"] });
			toast.success("Site created successfully");
			onCreated(site);
		} catch (err: any) {
			toast.error(err.message || "Failed to create site");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-5">
			<div className="flex flex-col gap-2">
				<Label className="text-[13px] font-medium">Site name</Label>
				<Input
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="My Blog"
					required
					className="bg-background border-border"
				/>
			</div>
			<div className="flex flex-col gap-2">
				<Label className="text-[13px] font-medium">Domain</Label>
				<Input
					value={domain}
					onChange={(e) => setDomain(e.target.value)}
					placeholder="example.com"
					required
					className="bg-background border-border"
				/>
			</div>
			<Button type="submit" className="w-full mt-4" disabled={isLoading}>
				{isLoading ? "Creating..." : "Create Site"}
			</Button>
		</form>
	);
}

function SuccessView({ site }: { site: SiteResponse }) {
	return (
		<div className="flex flex-col items-center justify-center flex-1 px-6 py-10 max-w-160 mx-auto text-center">
			<div
				className="size-30 rounded-full flex items-center justify-center mb-8"
				style={{
					background: "oklch(65% 0.14 145 / 0.1)",
					border: "2px solid oklch(65% 0.14 145)",
				}}
			>
				<Check className="size-12 text-[oklch(65%_0.14_145)]" />
			</div>
			<h2 className="font-display text-[32px] mb-4">Site created!</h2>
			<p className="text-base text-muted-foreground leading-relaxed mb-8">
				{site.name} ({site.domain}) has been added to your account.
			</p>
			<Link to="/dashboard">
				<Button size="lg" className="px-7 text-base">
					Go to Dashboard
				</Button>
			</Link>
		</div>
	);
}

function CreateSitePage() {
	const [createdSite, setCreatedSite] = useState<SiteResponse | null>(null);

	return (
		<div className="min-h-screen flex flex-col bg-background">
			{createdSite ? (
				<SuccessView site={createdSite} />
			) : (
				<div className="flex flex-col items-stretch justify-center flex-1 px-6 py-10 max-w-160 mx-auto w-full">
					<h2 className="font-display text-[32px] mb-4 text-center">
						Create a new site
					</h2>
					<p className="text-base text-muted-foreground leading-relaxed mb-8 text-center">
						Give it a name and tell us the domain.
					</p>
					<CreateSiteForm onCreated={(s) => setCreatedSite(s)} />
				</div>
			)}
		</div>
	);
}
