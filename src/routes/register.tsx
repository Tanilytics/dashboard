import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { register as registerFn } from "#/lib/api.functions";
import { redirectIfAuth } from "#/lib/auth-guards";

const registerSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/register")({
	component: RegisterPage,
	beforeLoad: redirectIfAuth,
	validateSearch: registerSearchSchema,
});

function TanilyticsLogo({ className }: { className?: string }) {
	return (
		<svg
			width="40"
			height="40"
			viewBox="0 0 28 28"
			fill="none"
			className={className}
		>
			<circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2.5" />
			<circle cx="14" cy="14" r="5" fill="currentColor" />
		</svg>
	);
}

function PasswordStrength({ password }: { password: string }) {
	let strength = 0;
	if (password.length > 5) strength++;
	if (/[A-Z]/.test(password)) strength++;
	if (/\d/.test(password)) strength++;
	if (password.length > 10) strength++;

	const getBarClass = (index: number) => {
		if (index >= strength) return "bg-border";
		if (strength < 2) return "bg-[oklch(65%_0.18_25)]";
		if (strength < 4) return "bg-[oklch(70%_0.12_80)]";
		return "bg-[oklch(65%_0.14_145)]";
	};

	return (
		<div className="flex gap-1 mt-2">
			{[0, 1, 2, 3].map((i) => (
				<div
					key={i}
					className={`flex-1 h-1 rounded-full transition-colors ${getBarClass(i)}`}
				/>
			))}
		</div>
	);
}

function RegisterPage() {
	const navigate = useNavigate();
	const { redirect } = Route.useSearch();
	const qc = useQueryClient();
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		setIsLoading(true);

		try {
			await registerFn({ data: { email, password } });
			qc.invalidateQueries({ queryKey: ["auth", "user"] });
			qc.invalidateQueries({ queryKey: ["sites"] });
			toast.success("Account created");
			navigate({ to: redirect || "/onboarding" });
		} catch (err: any) {
			toast.error(err.message || "Failed to create account");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-6 bg-background">
			<Card className="w-full max-w-110 border-border bg-card">
				<CardContent className="p-10">
					<div className="text-center mb-8">
						<TanilyticsLogo className="mx-auto mb-4 text-primary" />
						<h2 className="font-display text-[28px] mb-2">Create account</h2>
						<p className="text-sm text-muted-foreground">
							Start tracking in minutes
						</p>
					</div>

					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						<div className="flex flex-col gap-2">
							<Label htmlFor="email" className="text-[13px] font-medium">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="bg-background border-border"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="password" className="text-[13px] font-medium">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-background border-border"
							/>
							<PasswordStrength password={password} />
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="confirm" className="text-[13px] font-medium">
								Confirm password
							</Label>
							<Input
								id="confirm"
								type="password"
								placeholder="••••••••"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="bg-background border-border"
							/>
						</div>
						<Button type="submit" className="w-full mt-2" disabled={isLoading}>
							{isLoading ? "Creating account..." : "Create Account"}
						</Button>
					</form>

					<div className="text-center mt-6 text-sm text-muted-foreground">
						<p>
							Already have an account?{" "}
							<Link to="/login" className="text-primary underline">
								Sign in
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
