import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Copy, Check, Layers } from "lucide-react";
import { cn } from "#/lib/utils";
import { createSite } from "#/lib/api.functions";
import { useAuth } from "#/hooks/use-auth";
import type { SiteResponse } from "#/types/api";

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-4 px-6 py-8 border-b border-border">
      {[1, 2, 3, 4].map((step) => (
        <div
          key={step}
          className="size-2.5 rounded-full transition-colors"
          style={{
            background:
              step === currentStep
                ? "var(--primary)"
                : step < currentStep
                  ? "var(--primary)"
                  : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 max-w-160 mx-auto text-center">
      <div
        className="size-30 rounded-full flex items-center justify-center mb-8"
        style={{
          background: "oklch(58% 0.16 35 / 0.1)",
          border: "2px solid var(--primary)",
        }}
      >
        <Layers className="size-12 text-primary" />
      </div>
      <h2 className="font-display text-[32px] mb-4">Let's add your first site.</h2>
      <p className="text-base text-muted-foreground leading-relaxed mb-8">
        Tanilytics tracks one website per "site." You'll get a unique snippet to add to your pages.
      </p>
      <Button onClick={onNext} size="lg" className="px-7 text-base">
        Get Started
      </Button>
    </div>
  );
}

function Step2({ onNext }: { onNext: (site: SiteResponse) => void }) {
  const qc = useQueryClient();
  const { setCurrentSiteId } = useAuth();
  const [name, setName] = useState("My Blog");
  const [domain, setDomain] = useState("my-blog.com");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !domain) return;
    setIsLoading(true);
    try {
      const site = await createSite({ data: { name, domain } });
      setCurrentSiteId(site.id);
      qc.invalidateQueries({ queryKey: ['sites'] });
      toast.success("Site created successfully");
      onNext(site);
    } catch (err: any) {
      toast.error(err.message || "Failed to create site");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch justify-center flex-1 px-6 py-10 max-w-160 mx-auto">
      <h2 className="font-display text-[32px] mb-4 text-center">Create your site</h2>
      <p className="text-base text-muted-foreground leading-relaxed mb-8 text-center">
        Give it a name and tell us the domain.
      </p>
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
    </div>
  );
}

function Step3({ site, onNext }: { site: SiteResponse; onNext: () => void }) {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [packageManager, setPackageManager] = useState<"npm" | "pnpm" | "yarn" | "bun">("npm");

  const installCommands = {
    npm: "npm install tanilytics",
    pnpm: "pnpm add tanilytics",
    yarn: "yarn add tanilytics",
    bun: "bun add tanilytics",
  };

  const codeSnippet = `import tanilytics from 'tanilytics';

  tanilytics.init({
    siteId: '${site.id}',
    endpoint: 'https://ingest.example.com/api/v1/events',
  });`;

  const copySnippet = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
    toast.success("Snippet copied");
  };

  const copyInstall = () => {
    navigator.clipboard.writeText(installCommands[packageManager]);
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
    toast.success("Install command copied");
  };

  return (
    <div className="flex flex-col items-stretch justify-center flex-1 px-6 py-10 max-w-180 mx-auto">
      <h2 className="font-display text-[32px] mb-4 text-center">Add this to your site</h2>
      <p className="text-base text-muted-foreground leading-relaxed mb-8 text-center">
        Add this snippet to each page where you want to track events.
      </p>

      <Tabs defaultValue="generic" className="w-full mb-6">
        <TabsList className="bg-background border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger
            value="generic"
            className="text-[13px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Generic
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generic" className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Install</span>
            <div className="flex items-center gap-1 bg-background border border-border rounded-md p-0.5">
              {(["npm", "pnpm", "yarn", "bun"] as const).map((pm) => (
                <button
                  key={pm}
                  onClick={() => setPackageManager(pm)}
                  className={cn(
                    "px-2 py-1 text-xs rounded-sm transition-colors",
                    packageManager === pm
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>
          <div className="relative mb-6">
            <pre className="bg-[oklch(10%_0.01_60)] border border-border rounded-lg p-4 font-mono text-[13px] overflow-x-auto text-foreground">
              {installCommands[packageManager]}
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={copyInstall}
              className="absolute top-2 right-2 border-border"
            >
              {copiedInstall ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copiedInstall ? "Copied" : "Copy"}
            </Button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Tracking snippet
            </span>
            <Button variant="outline" size="sm" onClick={copySnippet} className="border-border">
              {copiedSnippet ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copiedSnippet ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="bg-[oklch(10%_0.01_60)] border border-border rounded-lg p-4 font-mono text-[13px] overflow-x-auto text-foreground">
            {codeSnippet}
          </pre>
        </TabsContent>
      </Tabs>

      <Button onClick={onNext} className="w-full mt-6">
        I've installed it
      </Button>
    </div>
  );
}

function Step4() {
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
      <h2 className="font-display text-[32px] mb-4">You're all set!</h2>
      <p className="text-base text-muted-foreground leading-relaxed mb-8">
        Data should start appearing within a few seconds of your first visitor.
      </p>
      <Link to="/dashboard">
        <Button size="lg" className="px-7 text-base">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [site, setSite] = useState<SiteResponse | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StepIndicator currentStep={step} />
      {step === 1 && <Step1 onNext={() => setStep(2)} />}
      {step === 2 && <Step2 onNext={(s) => { setSite(s); setStep(3); }} />}
      {step === 3 && site && <Step3 site={site} onNext={() => setStep(4)} />}
      {step === 4 && <Step4 />}
    </div>
  );
}
