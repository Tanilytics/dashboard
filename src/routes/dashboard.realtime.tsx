import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { Pause, Play } from 'lucide-react'

const sparklineData = Array.from({ length: 60 }, (_, i) => ({
  time: i,
  value: 30 + Math.sin(i * 0.2) * 20 + Math.random() * 15,
}))

export const Route = createFileRoute('/dashboard/realtime')({
  component: RealtimePage,
})

function RealtimePage() {
  const [activeUsers, setActiveUsers] = useState(12)
  const [pvHour, setPvHour] = useState(143)
  const [uvHour, setUvHour] = useState(89)
  const [mediaViewers, setMediaViewers] = useState(4)
  const [paused, setPaused] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setActiveUsers((prev) => Math.max(0, prev + Math.floor(Math.random() * 5) - 2))
      setPvHour((prev) => prev + Math.floor(Math.random() * 3))
      setUvHour((prev) => prev + Math.floor(Math.random() * 2))
      setMediaViewers((prev) => Math.max(0, prev + Math.floor(Math.random() * 3) - 1))

      const newEvents = [
        `New visitor from ${['Germany', 'USA', 'France', 'UK', 'Japan', 'Canada'][Math.floor(Math.random() * 6)]}`,
        `Page view: /blog/${['hello-world', 'design-systems', 'tutorial-1', 'podcast-ep-42'][Math.floor(Math.random() * 4)]}`,
        `Media play: /video/${['intro', 'tutorial-1'][Math.floor(Math.random() * 2)]}`,
      ]
      setEvents((prev) => [...prev.slice(-49), `${new Date().toLocaleTimeString()} — ${newEvents[Math.floor(Math.random() * newEvents.length)]}`])
    }, 2000)
    return () => clearInterval(interval)
  }, [paused])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Active Users */}
      <div className="text-center py-8">
        <div className="font-display font-semibold tracking-[-0.03em] leading-none" style={{ fontSize: 'clamp(48px, 6vw, 96px)' }}>
          {activeUsers}
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="size-2 rounded-full bg-[oklch(65%_0.14_145)] animate-pulse" />
          <span className="text-sm text-muted-foreground uppercase tracking-wider">Active users</span>
        </div>
      </div>

      {/* Sub-grid */}
      <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
        <Card>
          <CardContent className="p-6">
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-2">Page views this hour</div>
            <div className="font-display text-3xl font-semibold">{pvHour}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-2">Unique visitors this hour</div>
            <div className="font-display text-3xl font-semibold">{uvHour}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-2">Concurrent media viewers</div>
            <div className="font-display text-3xl font-semibold">{mediaViewers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Event Log + Sparkline */}
      <div className="grid grid-cols-[1fr_300px] gap-6 max-lg:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg font-semibold">Event log</CardTitle>
            <button
              onClick={() => setPaused(!paused)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-accent transition-colors"
            >
              {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
              {paused ? 'Resume' : 'Pause'}
            </button>
          </CardHeader>
          <CardContent>
            <div
              ref={scrollRef}
              className="h-[300px] overflow-y-auto font-mono text-xs space-y-1 pr-2"
            >
              {events.length === 0 && (
                <div className="text-muted-foreground text-center py-20">Waiting for events...</div>
              )}
              {events.map((event, i) => (
                <div key={i} className="text-muted-foreground py-0.5">
                  {event}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg font-semibold">Last 60 minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={sparklineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <RechartsTooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#sparkGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
