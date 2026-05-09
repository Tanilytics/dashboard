import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useAuth } from "#/hooks/use-auth";
import { getAggregate, getPages, getTimeseries } from "#/lib/api.functions";
import {
	getDateRange,
	useAggregate,
	useMedia,
	usePages,
	useRealtime,
	useReferrers,
	useTimeseries,
} from "#/lib/queries";

function LivePulseBar() {
	const { currentSiteId } = useAuth();
	const { data } = useRealtime(currentSiteId);

	return (
		<Card className="mb-6 border-l-[3px] border-l-[oklch(65%_0.14_145)]">
			<CardContent className="p-0">
				<div className="flex flex-wrap items-center gap-6 px-6 py-4">
					<div className="flex items-center gap-3">
						<span className="size-2 rounded-full bg-[oklch(65%_0.14_145)] animate-pulse" />
						<span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[oklch(65%_0.14_145)]">
							Live
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-lg font-semibold leading-tight">
							{data?.activeUsers ?? 0}
						</span>
						<span className="text-xs text-muted-foreground">Active users</span>
					</div>
					<div className="flex flex-col">
						<span className="text-lg font-semibold leading-tight">
							{data?.pageViewsCurrentHour ?? 0}
						</span>
						<span className="text-xs text-muted-foreground">
							Views this hour
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-lg font-semibold leading-tight">
							{data?.uniqueVisitorsCurrentHour ?? 0}
						</span>
						<span className="text-xs text-muted-foreground">
							Visitors this hour
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-lg font-semibold leading-tight">
							{Math.max(0, data?.concurrentMediaViewers ?? 0)}
						</span>
						<span className="text-xs text-muted-foreground">Media viewers</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function KPICard({
	label,
	value,
	delay,
	isLoading,
}: {
	label: string;
	value: string;
	delay: number;
	isLoading?: boolean;
}) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		const t = setTimeout(() => setMounted(true), delay);
		return () => clearTimeout(t);
	}, [delay]);

	return (
		<Card className="relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg h-full">
			<CardContent className="p-6">
				<div className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-2">
					{label}
				</div>
				{isLoading ? (
					<Skeleton className="h-10 w-24" />
				) : (
					<div
						className="font-display font-semibold tracking-[-0.02em] leading-[1.1]"
						style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}
					>
						{mounted ? value : "0"}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function ChartTooltip({ active, payload, label }: any) {
	if (!active || !payload) return null;
	const formattedLabel = (() => {
		try {
			const d = new Date(label);
			if (isNaN(d.getTime())) return label;
			return d.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
			});
		} catch {
			return label;
		}
	})();
	return (
		<div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
			<div className="text-[11px] text-muted-foreground mb-1">
				{formattedLabel}
			</div>
			{payload.map((entry: any, index: number) => (
				<div key={index} className="flex items-center gap-2 text-sm">
					<span
						className="size-2 rounded-full"
						style={{ background: entry.color }}
					/>
					<strong>{entry.value}</strong>{" "}
					{entry.name === "pageViews" ? "views" : "visitors"}
				</div>
			))}
		</div>
	);
}

function MainChart() {
	const { currentSiteId, dateRange } = useAuth();
	const { from, to } = getDateRange(dateRange);
	const { data, isLoading } = useTimeseries(currentSiteId, from, to);

	if (isLoading) {
		return (
			<Card className="mb-6">
				<CardHeader className="pb-2">
					<CardTitle className="font-display text-xl font-semibold tracking-tight">
						Traffic overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-90 w-full" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mb-6">
			<CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 pb-2">
				<CardTitle className="font-display text-xl font-semibold tracking-tight">
					Traffic overview
				</CardTitle>
				<div className="flex items-center gap-5 text-[13px]">
					<div className="flex items-center gap-2">
						<span
							className="size-2.5 rounded-full bg-primary"
							style={{ boxShadow: "0 0 8px oklch(58% 0.16 35 / 0.4)" }}
						/>
						Page views
					</div>
					<div className="flex items-center gap-2">
						<span
							className="size-2.5 rounded-full bg-[oklch(60%_0.12_180)]"
							style={{ boxShadow: "0 0 8px oklch(60% 0.12 180 / 0.3)" }}
						/>
						Unique visitors
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={360}>
					<AreaChart
						data={data || []}
						margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
					>
						<defs>
							<linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="0%"
									stopColor="oklch(58% 0.16 35)"
									stopOpacity={0.1}
								/>
								<stop
									offset="100%"
									stopColor="oklch(58% 0.16 35)"
									stopOpacity={0}
								/>
							</linearGradient>
							<linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="0%"
									stopColor="oklch(60% 0.12 180)"
									stopOpacity={0.06}
								/>
								<stop
									offset="100%"
									stopColor="oklch(60% 0.12 180)"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--border)"
							vertical={false}
						/>
						<XAxis
							dataKey="bucket"
							stroke="var(--muted-foreground)"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => {
								try {
									const d = new Date(value);
									if (isNaN(d.getTime())) return value;
									return d.toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									});
								} catch {
									return value;
								}
							}}
						/>
						<YAxis
							stroke="var(--muted-foreground)"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<RechartsTooltip content={<ChartTooltip />} />
						<Area
							type="monotone"
							dataKey="uniqueVisitors"
							stroke="oklch(60% 0.12 180)"
							strokeWidth={2}
							fill="url(#uvGradient)"
						/>
						<Area
							type="monotone"
							dataKey="pageViews"
							stroke="var(--primary)"
							strokeWidth={2.5}
							fill="url(#pvGradient)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

function TopPagesTable() {
	const { currentSiteId, dateRange } = useAuth();
	const { from, to } = getDateRange(dateRange);
	const { data, isLoading } = usePages(currentSiteId, from, to, 5);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display text-xl font-semibold tracking-tight">
					Top pages
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-65 w-full" />
				) : (
					<div className="overflow-x-auto border border-border rounded-xl">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border">
									<th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium w-10">
										#
									</th>
									<th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
										Page
									</th>
									<th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
										Views
									</th>
									<th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
										Visitors
									</th>
								</tr>
							</thead>
							<tbody>
								{(data || []).map((page, i) => (
									<tr
										key={page.url}
										className="border-b border-border last:border-0 hover:bg-[oklch(28%_0.015_60/0.4)] transition-colors"
									>
										<td className="px-4 py-3">
											<span
												className={`inline-flex items-center justify-center size-5 rounded-full text-[11px] font-semibold ${
													i < 2
														? "bg-primary text-primary-foreground"
														: "bg-border text-muted-foreground"
												}`}
											>
												{i + 1}
											</span>
										</td>
										<td className="px-4 py-3 truncate max-w-50">{page.url}</td>
										<td className="px-4 py-3">{page.views.toLocaleString()}</td>
										<td className="px-4 py-3">
											{page.uniqueVisitors.toLocaleString()}
										</td>
									</tr>
								))}
								{(!data || data.length === 0) && (
									<tr>
										<td
											colSpan={4}
											className="px-4 py-8 text-center text-muted-foreground"
										>
											No data yet
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function TopReferrersTable() {
	const { currentSiteId, dateRange } = useAuth();
	const { from, to } = getDateRange(dateRange);
	const { data, isLoading } = useReferrers(currentSiteId, from, to, 5);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-display text-xl font-semibold tracking-tight">
					Top referrers
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-65 w-full" />
				) : (
					<div className="overflow-x-auto border border-border rounded-xl">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border">
									<th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
										Source
									</th>
									<th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
										Visits
									</th>
									<th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
										Visitors
									</th>
								</tr>
							</thead>
							<tbody>
								{(data || []).map((ref) => (
									<tr
										key={ref.referrer}
										className="border-b border-border last:border-0 hover:bg-[oklch(28%_0.015_60/0.4)] transition-colors"
									>
										<td className="px-4 py-3">{ref.referrer}</td>
										<td className="px-4 py-3">{ref.visits.toLocaleString()}</td>
										<td className="px-4 py-3">
											{ref.uniqueVisitors.toLocaleString()}
										</td>
									</tr>
								))}
								{(!data || data.length === 0) && (
									<tr>
										<td
											colSpan={3}
											className="px-4 py-8 text-center text-muted-foreground"
										>
											No data yet
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function RingProgress({ value, size = 36 }: { value: number; size?: number }) {
	const circumference = 2 * Math.PI * 14;
	const offset = circumference - (value / 100) * circumference;
	const color =
		value > 75
			? "oklch(65% 0.14 145)"
			: value > 50
				? "oklch(70% 0.12 80)"
				: "var(--muted-foreground)";

	return (
		<svg width={size} height={size} viewBox="0 0 36 36" className="shrink-0">
			<circle
				cx="18"
				cy="18"
				r="14"
				fill="none"
				stroke="var(--border)"
				strokeWidth="3"
			/>
			<circle
				cx="18"
				cy="18"
				r="14"
				fill="none"
				stroke={color}
				strokeWidth="3"
				strokeDasharray={circumference}
				strokeDashoffset={offset}
				strokeLinecap="round"
				transform="rotate(-90 18 18)"
			/>
		</svg>
	);
}

function MediaOverview() {
	const { currentSiteId, dateRange } = useAuth();
	const { from, to } = getDateRange(dateRange);
	const { data, isLoading } = useMedia(currentSiteId, from, to, 3);

	return (
		<Card className="mb-6">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="font-display text-xl font-semibold tracking-tight">
					Media overview
				</CardTitle>
				<Link
					to="/dashboard/media"
					className="text-[13px] text-primary font-medium hover:underline"
				>
					View all media &rarr;
				</Link>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-32 w-full" />
						))}
					</div>
				) : (
					<div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
						{(data || []).map((item) => (
							<div
								key={item.mediaUrl}
								className="p-5 border border-border rounded-xl transition-all hover:border-[oklch(40%_0.02_60)]"
							>
								<div className="size-12 rounded-lg bg-muted flex items-center justify-center mb-3">
									<PlayCircle className="size-6" />
								</div>
								<div className="text-sm font-semibold mb-0.5 truncate">
									{item.mediaUrl}
								</div>
								<div className="text-xs text-muted-foreground mb-4">
									{item.plays.toLocaleString()} plays
								</div>
								<div className="flex items-center gap-3">
									<RingProgress
										value={Math.round(item.avgCompletionRate * 100)}
									/>
									<span className="text-xs text-muted-foreground">
										{Math.round(item.avgCompletionRate * 100)}% avg. completion
									</span>
								</div>
							</div>
						))}
						{(!data || data.length === 0) && (
							<div className="text-muted-foreground text-sm col-span-full py-8 text-center">
								No media data yet
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function OverviewPage() {
	const { currentSiteId, dateRange } = useAuth();
	const { from, to } = getDateRange(dateRange);
	const { data: aggregate, isLoading } = useAggregate(currentSiteId, from, to);

	const formatDuration = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	return (
		<div className="page-entrance">
			<LivePulseBar />

			<div className="grid grid-cols-5 gap-5 mb-6 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
				<div>
					<KPICard
						label="Page views"
						value={(aggregate?.pageViews ?? 0).toLocaleString()}
						delay={100}
						isLoading={isLoading}
					/>
				</div>
				<div>
					<KPICard
						label="Unique visitors"
						value={(aggregate?.uniqueVisitors ?? 0).toLocaleString()}
						delay={200}
						isLoading={isLoading}
					/>
				</div>
				<div>
					<KPICard
						label="Unique sessions"
						value={(aggregate?.uniqueSessions ?? 0).toLocaleString()}
						delay={300}
						isLoading={isLoading}
					/>
				</div>
				<div>
					<KPICard
						label="Bounce rate"
						value={`${Math.round((aggregate?.bounceRate ?? 0) * 100)}%`}
						delay={400}
						isLoading={isLoading}
					/>
				</div>
				<div>
					<KPICard
						label="Avg. session"
						value={formatDuration(aggregate?.avgSessionDurationSeconds ?? 0)}
						delay={500}
						isLoading={isLoading}
					/>
				</div>
			</div>

			<MainChart />

			<div className="grid grid-cols-[1.2fr_1fr] gap-6 mb-6 max-lg:grid-cols-1">
				<TopPagesTable />
				<TopReferrersTable />
			</div>

			<MediaOverview />
		</div>
	);
}

export const Route = createFileRoute("/dashboard/")({
	component: OverviewPage,
	loader: async ({ context }) => {
		const { queryClient } = context;
		const sites = queryClient.getQueryData<{ id: string }[]>(["sites"]);
		const siteId = sites?.[0]?.id ?? null;
		if (siteId) {
			const { from, to } = getDateRange("7d");
			await Promise.all([
				queryClient.prefetchQuery({
					queryKey: ["analytics", siteId, "aggregate", from, to],
					queryFn: () => getAggregate({ data: { siteId, from, to } }),
				}),
				queryClient.prefetchQuery({
					queryKey: ["analytics", siteId, "timeseries", from, to],
					queryFn: () => getTimeseries({ data: { siteId, from, to } }),
				}),
				queryClient.prefetchQuery({
					queryKey: ["analytics", siteId, "pages", from, to, 5],
					queryFn: () => getPages({ data: { siteId, from, to, limit: 5 } }),
				}),
			]);
		}
	},
});
