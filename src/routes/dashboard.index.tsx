import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { ArrowUpRight, ArrowDownRight, PlayCircle } from 'lucide-react'

// Demo data
const timeseriesData = [
  { bucket: '00:00', pageViews: 30, uniqueVisitors: 20 },
  { bucket: '01:00', pageViews: 45, uniqueVisitors: 28 },
  { bucket: '02:00', pageViews: 38, uniqueVisitors: 25 },
  { bucket: '03:00', pageViews: 52, uniqueVisitors: 35 },
  { bucket: '04:00', pageViews: 48, uniqueVisitors: 32 },
  { bucket: '05:00', pageViews: 65, uniqueVisitors: 42 },
  { bucket: '06:00', pageViews: 80, uniqueVisitors: 55 },
  { bucket: '07:00', pageViews: 75, uniqueVisitors: 50 },
  { bucket: '08:00', pageViews: 90, uniqueVisitors: 62 },
  { bucket: '09:00', pageViews: 110, uniqueVisitors: 75 },
  { bucket: '10:00', pageViews: 105, uniqueVisitors: 70 },
  { bucket: '11:00', pageViews: 130, uniqueVisitors: 88 },
  { bucket: '12:00', pageViews: 125, uniqueVisitors: 82 },
  { bucket: '13:00', pageViews: 140, uniqueVisitors: 95 },
  { bucket: '14:00', pageViews: 160, uniqueVisitors: 110 },
  { bucket: '15:00', pageViews: 155, uniqueVisitors: 105 },
  { bucket: '16:00', pageViews: 170, uniqueVisitors: 120 },
  { bucket: '17:00', pageViews: 185, uniqueVisitors: 135 },
  { bucket: '18:00', pageViews: 180, uniqueVisitors: 128 },
  { bucket: '19:00', pageViews: 200, uniqueVisitors: 145 },
  { bucket: '20:00', pageViews: 195, uniqueVisitors: 140 },
  { bucket: '21:00', pageViews: 210, uniqueVisitors: 155 },
  { bucket: '22:00', pageViews: 230, uniqueVisitors: 170 },
  { bucket: '23:00', pageViews: 220, uniqueVisitors: 162 },
]

const topPages = [
  { url: '/blog/hello-world', views: 3241, visitors: 2104 },
  { url: '/about', views: 1892, visitors: 1560 },
  { url: '/blog/design-systems', views: 1504, visitors: 1201 },
  { url: '/podcast/ep-42', views: 987, visitors: 843 },
  { url: '/video/tutorial-1', views: 654, visitors: 521 },
]

const topReferrers = [
  { referrer: 'Google', visits: 4210, visitors: 3801 },
  { referrer: 'Direct / None', visits: 2156, visitors: 1902 },
  { referrer: 'Twitter / X', visits: 1043, visitors: 987 },
  { referrer: 'Hacker News', visits: 892, visitors: 876 },
  { referrer: 'GitHub', visits: 430, visitors: 401 },
]

const mediaItems = [
  { url: '/video/tutorial-1', plays: 1204, completion: 78 },
  { url: '/podcast/ep-42', plays: 892, completion: 64 },
  { url: '/video/intro', plays: 654, completion: 45 },
]

function LivePulseBar() {
  const [live, setLive] = useState({ active: 12, pv: 143, uv: 89, media: 4 })

  useEffect(() => {
    const interval = setInterval(() => {
      setLive((prev) => ({
        active: prev.active + Math.floor(Math.random() * 3) - 1,
        pv: prev.pv + Math.floor(Math.random() * 5),
        uv: prev.uv + Math.floor(Math.random() * 3),
        media: prev.media + Math.floor(Math.random() * 2) - 1,
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="mb-6 border-l-[3px] border-l-[oklch(65%_0.14_145)]">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-[oklch(65%_0.14_145)] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[oklch(65%_0.14_145)]">Live</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight">{live.active}</span>
            <span className="text-xs text-muted-foreground">Active users</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight">{live.pv}</span>
            <span className="text-xs text-muted-foreground">Views this hour</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight">{live.uv}</span>
            <span className="text-xs text-muted-foreground">Visitors this hour</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight">{Math.max(0, live.media)}</span>
            <span className="text-xs text-muted-foreground">Media viewers</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function KPICard({ label, value, delta, deltaType, delay }: { label: string; value: string; delta: string; deltaType: 'up' | 'down'; delay: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <Card className="relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-2">{label}</div>
        <div
          className="font-display font-semibold tracking-[-0.02em] leading-[1.1]"
          style={{ fontSize: label === 'Page views' ? 'clamp(40px, 4vw, 64px)' : 'clamp(28px, 3vw, 40px)' }}
        >
          {mounted ? value : '0'}
        </div>
        <div
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold mt-2 ${
            deltaType === 'up'
              ? 'bg-[oklch(65%_0.14_145_/_0.12)] text-[oklch(70%_0.12_145)]'
              : 'bg-[oklch(65%_0.18_25_/_0.12)] text-[oklch(70%_0.14_25)]'
          }`}
        >
          {deltaType === 'up' ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {delta}
        </div>
      </CardContent>
    </Card>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full" style={{ background: entry.color }} />
          <strong>{entry.value}</strong> {entry.name === 'pageViews' ? 'views' : 'visitors'}
        </div>
      ))}
    </div>
  )
}

function MainChart() {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 pb-2">
        <CardTitle className="font-display text-xl font-semibold tracking-tight">Traffic overview</CardTitle>
        <div className="flex items-center gap-5 text-[13px]">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" style={{ boxShadow: '0 0 8px oklch(58% 0.16 35 / 0.4)' }} />
            Page views
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[oklch(60%_0.12_180)]" style={{ boxShadow: '0 0 8px oklch(60% 0.12 180 / 0.3)' }} />
            Unique visitors
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={timeseriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(58% 0.16 35)" stopOpacity={0.1} />
                <stop offset="100%" stopColor="oklch(58% 0.16 35)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(60% 0.12 180)" stopOpacity={0.06} />
                <stop offset="100%" stopColor="oklch(60% 0.12 180)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="bucket" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
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
  )
}

function TopPagesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl font-semibold tracking-tight">Top pages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium w-10">#</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Page</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Views</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Visitors</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((page, i) => (
                <tr key={page.url} className="border-b border-border last:border-0 hover:bg-[oklch(28%_0.015_60_/_0.4)] transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center justify-center size-5 rounded-full text-[11px] font-semibold ${
                        i < 2 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 truncate max-w-[200px]">{page.url}</td>
                  <td className="px-4 py-3">{page.views.toLocaleString()}</td>
                  <td className="px-4 py-3">{page.visitors.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function TopReferrersTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl font-semibold tracking-tight">Top referrers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Source</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Visits</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Visitors</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map((ref) => (
                <tr key={ref.referrer} className="border-b border-border last:border-0 hover:bg-[oklch(28%_0.015_60_/_0.4)] transition-colors">
                  <td className="px-4 py-3">{ref.referrer}</td>
                  <td className="px-4 py-3">{ref.visits.toLocaleString()}</td>
                  <td className="px-4 py-3">{ref.visitors.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function RingProgress({ value, size = 36 }: { value: number; size?: number }) {
  const circumference = 2 * Math.PI * 14
  const offset = circumference - (value / 100) * circumference
  const color = value > 75 ? 'oklch(65% 0.14 145)' : value > 50 ? 'oklch(70% 0.12 80)' : 'var(--muted-foreground)'

  return (
    <svg width={size} height={size} viewBox="0 0 36 36" className="shrink-0">
      <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="3" />
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
  )
}

function MediaOverview() {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-xl font-semibold tracking-tight">Media overview</CardTitle>
        <Link to="/dashboard/media" className="text-[13px] text-primary font-medium hover:underline">
          View all media &rarr;
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          {mediaItems.map((item) => (
            <div
              key={item.url}
              className="p-5 border border-border rounded-xl transition-all hover:border-[oklch(40%_0.02_60)]"
            >
              <div className="size-12 rounded-lg bg-muted flex items-center justify-center mb-3">
                <PlayCircle className="size-6" />
              </div>
              <div className="text-sm font-semibold mb-0.5 truncate">{item.url}</div>
              <div className="text-xs text-muted-foreground mb-4">{item.plays.toLocaleString()} plays</div>
              <div className="flex items-center gap-3">
                <RingProgress value={item.completion} />
                <span className="text-xs text-muted-foreground">{item.completion}% avg. completion</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function OverviewPage() {
  return (
    <div className="page-entrance">
      <LivePulseBar />

      <div
        className="grid gap-5 mb-6"
        style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}
      >
        <div className="col-span-4 max-xl:col-span-4 max-lg:col-span-6 max-md:col-span-12">
          <KPICard label="Page views" value="12,847" delta="12.4%" deltaType="up" delay={100} />
        </div>
        <div className="col-span-2 max-xl:col-span-2 max-lg:col-span-4 max-md:col-span-6 max-sm:col-span-12">
          <KPICard label="Unique visitors" value="8,231" delta="8.2%" deltaType="up" delay={200} />
        </div>
        <div className="col-span-2 max-xl:col-span-2 max-lg:col-span-4 max-md:col-span-6 max-sm:col-span-12">
          <KPICard label="Unique sessions" value="9,456" delta="5.1%" deltaType="up" delay={300} />
        </div>
        <div className="col-span-2 max-xl:col-span-2 max-lg:col-span-4 max-md:col-span-6 max-sm:col-span-12">
          <KPICard label="Bounce rate" value="42%" delta="2.3%" deltaType="down" delay={400} />
        </div>
        <div className="col-span-2 max-xl:col-span-2 max-lg:col-span-4 max-md:col-span-6 max-sm:col-span-12">
          <KPICard label="Avg. session" value="02:34" delta="4.5%" deltaType="up" delay={500} />
        </div>
      </div>

      <MainChart />

      <div className="grid grid-cols-[1.2fr_1fr] gap-6 mb-6 max-lg:grid-cols-1">
        <TopPagesTable />
        <TopReferrersTable />
      </div>

      <MediaOverview />
    </div>
  )
}

export const Route = createFileRoute('/dashboard/')({
  component: OverviewPage,
})
