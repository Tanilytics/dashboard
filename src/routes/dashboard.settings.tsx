import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Skeleton } from "#/components/ui/skeleton";
import { useAuth } from "#/hooks/use-auth";
import {
	useAddMember,
	useMembers,
	useRotateApiKey,
	useSiteSettings,
	useUpdateSiteSettings,
} from "#/lib/queries";

export const Route = createFileRoute("/dashboard/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { currentSiteId } = useAuth();
	const { data: settings, isLoading: settingsLoading } =
		useSiteSettings(currentSiteId);
	const { data: members, isLoading: membersLoading } =
		useMembers(currentSiteId);

	const updateSettings = useUpdateSiteSettings(currentSiteId);
	const rotateApiKey = useRotateApiKey(currentSiteId);
	const addMember = useAddMember(currentSiteId);

	const [siteName, setSiteName] = useState("");
	const [retentionDays, setRetentionDays] = useState(365);
	const [rateLimit, setRateLimit] = useState(10);
	const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
	const [copiedKey, setCopiedKey] = useState(false);
	const [rotateModalOpen, setRotateModalOpen] = useState(false);
	const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
	const [rotatedKey, setRotatedKey] = useState("");
	const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
	const [newMemberEmail, setNewMemberEmail] = useState("");
	const [newMemberRole, setNewMemberRole] = useState<
		"admin" | "editor" | "viewer"
	>("viewer");

	useEffect(() => {
		if (settings) {
			setSiteName(settings.name);
			setRetentionDays(settings.retentionDays);
			setRateLimit(settings.rateLimitRps);
		}
	}, [settings]);

	const apiKey = settings?.apiKey || "";

	const copyKey = () => {
		if (!apiKey) return;
		navigator.clipboard.writeText(apiKey);
		setCopiedKey(true);
		setTimeout(() => setCopiedKey(false), 2000);
		toast.success("API key copied");
	};

	const handleRotate = async () => {
		try {
			const result = await rotateApiKey.mutateAsync();
			setRotateModalOpen(false);
			setRotatedKey(result.apiKey);
			setNewKeyModalOpen(true);
			toast.success("API key rotated");
		} catch (err: any) {
			toast.error(err.detail || err.message || "Failed to rotate key");
		}
	};

	const handleAddMember = async () => {
		try {
			await addMember.mutateAsync({
				email: newMemberEmail,
				role: newMemberRole,
			});
			setAddMemberModalOpen(false);
			toast.success("Member invited");
			setNewMemberEmail("");
		} catch (err: any) {
			toast.error(err.detail || err.message || "Failed to add member");
		}
	};

	const handleSaveSettings = async () => {
		try {
			await updateSettings.mutateAsync({
				settings: settings?.settings ?? {},
				retentionDays,
				rateLimitRps: rateLimit,
			});
			toast.success("Settings saved");
		} catch (err: any) {
			toast.error(err.detail || err.message || "Failed to save settings");
		}
	};

	return (
		<div className="flex flex-col gap-6 max-w-200">
			{/* General */}
			<Card>
				<CardHeader>
					<CardTitle className="font-display text-lg font-semibold">
						General
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-5">
					<div className="flex flex-col gap-2">
						<Label className="text-[13px] font-medium">Site name</Label>
						{settingsLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Input
								value={siteName}
								onChange={(e) => setSiteName(e.target.value)}
								className="bg-background border-border"
							/>
						)}
					</div>
					<div className="flex flex-col gap-2">
						<Label className="text-[13px] font-medium">Domain</Label>
						<Input
							value={settings?.domain || ""}
							readOnly
							className="bg-[oklch(28%_0.015_60)] text-muted-foreground cursor-not-allowed border-border"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Data & Limits */}
			<Card>
				<CardHeader>
					<CardTitle className="font-display text-lg font-semibold">
						Data & limits
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-5">
					<div className="flex flex-col gap-2">
						<Label className="text-[13px] font-medium">
							Data retention (days)
						</Label>
						{settingsLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Input
								type="number"
								value={retentionDays}
								onChange={(e) => setRetentionDays(Number(e.target.value))}
								min={30}
								className="bg-background border-border"
							/>
						)}
						<p className="text-xs text-muted-foreground">
							How long raw event data is kept.
						</p>
					</div>
					<div className="flex flex-col gap-2">
						<Label className="text-[13px] font-medium">
							Rate limit (requests / second)
						</Label>
						{settingsLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Input
								type="number"
								value={rateLimit}
								onChange={(e) => setRateLimit(Number(e.target.value))}
								min={1}
								className="bg-background border-border"
							/>
						)}
						<p className="text-xs text-muted-foreground">
							Maximum events per second from your site.
						</p>
					</div>
					<Button
						onClick={handleSaveSettings}
						className="w-fit"
						disabled={updateSettings.isPending || settingsLoading}
					>
						{updateSettings.isPending ? "Saving..." : "Save changes"}
					</Button>
				</CardContent>
			</Card>

			{/* API Key */}
			<Card>
				<CardHeader>
					<CardTitle className="font-display text-lg font-semibold">
						API key
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between gap-4 bg-[oklch(10%_0.01_60)] border border-border rounded-lg p-4 mb-4">
						{settingsLoading ? (
							<Skeleton className="h-5 w-full" />
						) : (
							<>
								<span className="font-mono text-sm truncate">
									{apiKeyRevealed
										? apiKey
										: "tly_••••••••••••••••••••••••••••••••"}
								</span>
								<div className="flex items-center gap-2 shrink-0">
									<Button
										variant="outline"
										size="sm"
										onClick={copyKey}
										className="border-border"
										disabled={!apiKey}
									>
										{copiedKey ? (
											<Check className="size-3.5" />
										) : (
											<Copy className="size-3.5" />
										)}
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setApiKeyRevealed(!apiKeyRevealed)}
										className="border-border"
										disabled={!apiKey}
									>
										{apiKeyRevealed ? (
											<EyeOff className="size-3.5" />
										) : (
											<Eye className="size-3.5" />
										)}
									</Button>
								</div>
							</>
						)}
					</div>
					<Button
						variant="destructive"
						onClick={() => setRotateModalOpen(true)}
						disabled={settingsLoading || rotateApiKey.isPending}
					>
						Rotate key
					</Button>
				</CardContent>
			</Card>

			{/* Team Members */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="font-display text-lg font-semibold">
						Team members
					</CardTitle>
					<Button
						size="sm"
						onClick={() => setAddMemberModalOpen(true)}
						disabled={membersLoading}
					>
						Add member
					</Button>
				</CardHeader>
				<CardContent>
					{membersLoading ? (
						<Skeleton className="h-37.5 w-full" />
					) : (
						<div className="overflow-x-auto border border-border rounded-xl">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-border">
										<th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
											Email
										</th>
										<th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
											Role
										</th>
										<th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
											Action
										</th>
									</tr>
								</thead>
								<tbody>
									{(members || []).map((member) => (
										<tr
											key={member.userId}
											className="border-b border-border last:border-0 hover:bg-[oklch(28%_0.015_60/0.4)] transition-colors"
										>
											<td className="px-4 py-3">{member.email}</td>
											<td className="px-4 py-3">
												<span className="px-2.5 py-0.5 rounded-full bg-border text-xs capitalize">
													{member.role}
												</span>
											</td>
											<td className="px-4 py-3">
												<Button variant="destructive" size="sm">
													Remove
												</Button>
											</td>
										</tr>
									))}
									{(!members || members.length === 0) && (
										<tr>
											<td
												colSpan={3}
												className="px-4 py-8 text-center text-muted-foreground"
											>
												No members yet
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Privacy Settings */}
			<Card>
				<CardHeader>
					<CardTitle className="font-display text-lg font-semibold">
						Privacy settings
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-50">
						<div>
							<div className="font-medium text-sm">Respect Do Not Track</div>
							<div className="text-xs text-muted-foreground">
								Ignore visitors with DNT enabled
							</div>
						</div>
						<div className="w-10 h-5.5 rounded-full bg-border relative">
							<span className="absolute left-0.5 top-0.5 size-4.5 rounded-full bg-card" />
						</div>
					</div>
					<div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-50">
						<div>
							<div className="font-medium text-sm">Mask query parameters</div>
							<div className="text-xs text-muted-foreground">
								Strip UTM and query strings from URLs
							</div>
						</div>
						<div className="w-10 h-5.5 rounded-full bg-border relative">
							<span className="absolute left-0.5 top-0.5 size-4.5 rounded-full bg-card" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Rotate Key Modal */}
			<Dialog open={rotateModalOpen} onOpenChange={setRotateModalOpen}>
				<DialogContent className="bg-card border-border">
					<DialogHeader>
						<DialogTitle className="font-display text-xl font-semibold">
							Rotate API key?
						</DialogTitle>
						<DialogDescription className="text-muted-foreground">
							This will invalidate your old key immediately. Any active trackers
							using the old key will stop working. Are you sure?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-3">
						<Button
							variant="outline"
							onClick={() => setRotateModalOpen(false)}
							className="border-border"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleRotate}
							disabled={rotateApiKey.isPending}
						>
							{rotateApiKey.isPending ? "Rotating..." : "Rotate key"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* New Key Modal */}
			<Dialog open={newKeyModalOpen} onOpenChange={setNewKeyModalOpen}>
				<DialogContent className="bg-card border-border">
					<DialogHeader>
						<DialogTitle className="font-display text-xl font-semibold">
							New API key
						</DialogTitle>
						<DialogDescription className="text-muted-foreground">
							Copy this now. You won't see it again.
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center justify-between gap-4 bg-[oklch(10%_0.01_60)] border border-border rounded-lg p-4">
						<span className="font-mono text-sm truncate">{rotatedKey}</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								navigator.clipboard.writeText(rotatedKey);
								toast.success("Copied");
							}}
							className="border-border shrink-0"
						>
							<Copy className="size-3.5" />
						</Button>
					</div>
					<DialogFooter>
						<Button onClick={() => setNewKeyModalOpen(false)}>Done</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Add Member Modal */}
			<Dialog open={addMemberModalOpen} onOpenChange={setAddMemberModalOpen}>
				<DialogContent className="bg-card border-border">
					<DialogHeader>
						<DialogTitle className="font-display text-xl font-semibold">
							Add team member
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-5">
						<div className="flex flex-col gap-2">
							<Label className="text-[13px] font-medium">Email</Label>
							<Input
								type="email"
								placeholder="colleague@example.com"
								value={newMemberEmail}
								onChange={(e) => setNewMemberEmail(e.target.value)}
								className="bg-background border-border"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label className="text-[13px] font-medium">Role</Label>
							<select
								value={newMemberRole}
								onChange={(e) =>
									setNewMemberRole(
										e.target.value as "admin" | "editor" | "viewer",
									)
								}
								className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
							>
								<option value="viewer">Viewer</option>
								<option value="editor">Editor</option>
								<option value="admin">Admin</option>
							</select>
						</div>
					</div>
					<DialogFooter className="gap-3">
						<Button
							variant="outline"
							onClick={() => setAddMemberModalOpen(false)}
							className="border-border"
						>
							Cancel
						</Button>
						<Button
							onClick={handleAddMember}
							disabled={addMember.isPending || !newMemberEmail}
						>
							{addMember.isPending ? "Sending..." : "Send invite"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
