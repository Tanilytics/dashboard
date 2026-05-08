import { useState } from "react";
import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import { useAuth } from "#/hooks/use-auth";
import { cn } from "#/lib/utils";
import {
  LayoutDashboard,
  Activity,
  FileText,
  PlayCircle,
  TrendingUp,
  Filter,
  Flame,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
  CircleDot,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "#/components/ui/sheet";
import { Avatar, AvatarFallback } from "#/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "#/components/ui/tooltip";
import TanStackQueryDevtools from "#/integrations/tanstack-query/devtools";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/realtime", label: "Realtime", icon: Activity },
  { to: "/dashboard/pages", label: "Pages", icon: FileText },
  { to: "/dashboard/media", label: "Media", icon: PlayCircle },
  { to: "/dashboard/acquisition", label: "Acquisition", icon: TrendingUp },
  { to: "/dashboard/funnels", label: "Funnels", icon: Filter, soon: true },
  { to: "/dashboard/heatmaps", label: "Heatmaps", icon: Flame, soon: true },
];

function TanilyticsLogo({ className }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className={className}>
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="14" cy="14" r="5" fill="currentColor" />
    </svg>
  );
}

function SiteSwitcher() {
  const { sites, currentSiteId, setCurrentSiteId } = useAuth();
  const currentSite = sites.find((s) => s.id === currentSiteId);
  const [open, setOpen] = useState(false);

  if (sites.length === 0) {
    return (
      <Link
        to="/onboarding"
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-accent transition-colors"
      >
        <CircleDot className="size-4" />
        <span>Create Site</span>
      </Link>
    );
  }

  if (sites.length === 1) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
        <div
          className="flex size-7 items-center justify-center rounded-md text-xs font-bold"
          style={{
            background: "oklch(58% 0.16 35 / 0.15)",
            color: "var(--primary)",
          }}
        >
          {currentSite?.name.charAt(0).toUpperCase() || "?"}
        </div>
        <span className="truncate">{currentSite?.name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-xs transition-colors hover:border-[oklch(40%_0.02_60)] hover:bg-[oklch(24%_0.018_60)] focus:outline-none focus:ring-2 focus:ring-ring">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex size-7 items-center justify-center rounded-md text-xs font-bold shrink-0"
            style={{
              background: "oklch(58% 0.16 35 / 0.15)",
              color: "var(--primary)",
            }}
          >
            {currentSite?.name.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-medium">{currentSite?.name}</span>
            <span className="truncate text-[11px] text-muted-foreground">
              {currentSite?.domain}
            </span>
          </div>
        </div>
        <ChevronDown
          className="size-3.5 shrink-0 text-muted-foreground transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[--radix-dropdown-menu-trigger-width] bg-card border-border"
      >
        <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Your sites
        </div>
        {sites.map((site) => (
          <DropdownMenuItem
            key={site.id}
            onClick={() => {
              setCurrentSiteId(site.id);
              setOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer focus:bg-[oklch(28%_0.015_60_/_0.5)]"
          >
            <div
              className="flex size-7 items-center justify-center rounded-md text-xs font-bold shrink-0"
              style={{
                background:
                  site.id === currentSiteId ? "oklch(58% 0.16 35 / 0.15)" : "oklch(28% 0.015 60)",
                color: site.id === currentSiteId ? "var(--primary)" : "var(--muted-foreground)",
              }}
            >
              {site.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm">{site.name}</span>
              <span className="truncate text-[11px] text-muted-foreground">{site.domain}</span>
            </div>
            {site.id === currentSiteId && (
              <svg
                className="ml-auto size-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </DropdownMenuItem>
        ))}
        <div className="h-px bg-border mx-2 my-1" />
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-[oklch(28%_0.015_60_/_0.5)]">
          <Link to="/onboarding" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md text-xs font-bold border border-dashed border-border text-muted-foreground">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">Create new site</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const { currentSiteId } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
            const content = (
              <Link
                to={item.soon ? "#" : item.to}
                params={{ siteId: currentSiteId || "" }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-[oklch(58%_0.16_35_/_0.08)] text-primary border-l-[3px] border-primary pl-[9px]"
                    : "text-muted-foreground hover:bg-[oklch(28%_0.015_60)] hover:text-foreground",
                  item.soon && "opacity-50 italic",
                )}
                onClick={(e) => item.soon && e.preventDefault()}
              >
                <item.icon className="size-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.soon && (
                      <span className="ml-auto rounded-full bg-border px-2 py-0.5 text-[11px] font-normal not-italic text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <li key={item.to}>
                  <Tooltip>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-card border-border">
                      {item.label}
                      {item.soon && " (Soon)"}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={item.to}>{content}</li>;
          })}
        </ul>
      </nav>
    </TooltipProvider>
  );
}

function UserFooter({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();

  return (
    <div className="border-t border-border p-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-8 shrink-0 bg-primary text-primary-foreground">
          <AvatarFallback className="text-xs font-semibold">
            {user?.email?.slice(0, 2).toUpperCase() || "??"}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="truncate text-[13px] font-medium">{user?.email}</div>
            <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
          </div>
        )}
        {!collapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-accent transition-colors">
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem onClick={logout} className="cursor-pointer focus:bg-accent">
                <LogOut className="size-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { currentSiteId } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const pageTitle = navItems.find((item) => item.to === currentPath)?.label || "Overview";
  const showDateRange = [
    "/dashboard",
    "/dashboard/realtime",
    "/dashboard/pages",
    "/dashboard/media",
    "/dashboard/acquisition",
  ].includes(currentPath);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r border-border bg-card transition-all duration-200 ease-in-out",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="p-5 pb-4">
          <Link to="/" className="flex items-center gap-3 text-foreground">
            <TanilyticsLogo className="shrink-0 text-primary" />
            {!collapsed && (
              <span className="font-display text-xl font-semibold tracking-tight">Tanilytics</span>
            )}
          </Link>
        </div>

        {!collapsed && (
          <div className="px-4 pb-4">
            <SiteSwitcher />
          </div>
        )}

        <SidebarNav collapsed={collapsed} />

        <div className="mt-auto">
          <Link
            to="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors m-3",
              currentPath === "/dashboard/settings"
                ? "bg-[oklch(58%_0.16_35/0.08)] text-primary border-l-[3px] border-primary pl-2.25"
                : "text-muted-foreground hover:bg-[oklch(28%_0.015_60)] hover:text-foreground",
            )}
          >
            <Settings className="size-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
          <UserFooter collapsed={collapsed} />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 border-t border-border p-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-card border border-border">
            <Menu className="size-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-card border-r border-border p-0 flex flex-col">
          <div className="p-5 pb-4">
            <Link to="/" className="flex items-center gap-3 text-foreground">
              <TanilyticsLogo className="shrink-0 text-primary" />
              <span className="font-display text-xl font-semibold tracking-tight">Tanilytics</span>
            </Link>
          </div>
          <div className="px-4 pb-4">
            <SiteSwitcher />
          </div>
          <SidebarNav collapsed={false} />
          <div className="mt-auto">
            <Link
              to="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors m-3",
                currentPath === "/dashboard/settings"
                  ? "bg-[oklch(58%_0.16_35_/_0.08)] text-primary border-l-[3px] border-primary pl-[9px]"
                  : "text-muted-foreground hover:bg-[oklch(28%_0.015_60)] hover:text-foreground",
              )}
            >
              <Settings className="size-5 shrink-0" />
              <span>Settings</span>
            </Link>
            <UserFooter collapsed={false} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Bar */}
        <header className="flex shrink-0 h-14 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-[22px] font-semibold tracking-tight">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            {showDateRange && (
              <div className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-1.5 text-[13px] text-muted-foreground">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Last 7 days</span>
                <ChevronDown className="size-3" />
              </div>
            )}
            <button className="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1 right-1 size-[7px] rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <TanStackQueryDevtools />
    </div>
  );
}
