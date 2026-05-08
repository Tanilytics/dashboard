import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Card, CardContent } from "#/components/ui/card";
import { useAuth } from "#/hooks/use-auth";
import { authApi } from "#/lib/api";
import { toast } from "sonner";

function redirectIfAuth() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      throw redirect({ to: '/dashboard' })
    }
  }
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
  beforeLoad: redirectIfAuth,
});

function TanilyticsLogo({ className }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 28 28" fill="none" className={className}>
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="14" cy="14" r="5" fill="currentColor" />
    </svg>
  );
}

function LoginPage() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tokens = await authApi.login(email, password);
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      setUser({
        id: "",
        email,
        role: "admin",
        createdAt: new Date().toISOString(),
      });

      toast.success("Signed in successfully");
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in");
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
            <h2 className="font-display text-[28px] mb-2">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your Tanilytics account</p>
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
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p className="mb-2">
              <Link to="/" className="text-primary underline">
                Forgot password?
              </Link>
            </p>
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="text-primary underline">
                Register
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
