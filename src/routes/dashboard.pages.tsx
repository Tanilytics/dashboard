import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'

const allPages = [
  { url: '/blog/hello-world', views: 3241, visitors: 2104, sessions: 2400, avgTime: 142 },
  { url: '/about', views: 1892, visitors: 1560, sessions: 1700, avgTime: 89 },
  { url: '/blog/design-systems', views: 1504, visitors: 1201, sessions: 1350, avgTime: 234 },
  { url: '/podcast/ep-42', views: 987, visitors: 843, sessions: 920, avgTime: 1856 },
  { url: '/video/tutorial-1', views: 654, visitors: 521, sessions: 600, avgTime: 420 },
  { url: '/blog/getting-started', views: 543, visitors: 432, sessions: 480, avgTime: 120 },
  { url: '/contact', views: 432, visitors: 389, sessions: 410, avgTime: 45 },
  { url: '/blog/performance', views: 389, visitors: 312, sessions: 350, avgTime: 198 },
  { url: '/video/intro', views: 321, visitors: 278, sessions: 300, avgTime: 180 },
  { url: '/podcast/ep-41', views: 287, visitors: 245, sessions: 260, avgTime: 1720 },
]

export const Route = createFileRoute('/dashboard/pages')({
  component: PagesPage,
})

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function PagesPage() {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'views' | 'visitors' | 'sessions' | 'avgTime'>('views')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    let data = allPages.filter((p) => p.url.toLowerCase().includes(search.toLowerCase()))
    data = [...data].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey]
      return sortDir === 'asc' ? diff : -diff
    })
    return data
  }, [search, sortKey, sortDir])

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="font-display text-xl font-semibold tracking-tight">Pages</CardTitle>
        <Input
          placeholder="Search by URL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[280px] bg-background border-border max-sm:w-full"
        />
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-muted-foreground mb-4">No pages found matching "{search}"</div>
          </div>
        ) : (
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Page</th>
                  <th
                    className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('views')}
                  >
                    Views {sortKey === 'views' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('visitors')}
                  >
                    Visitors {sortKey === 'visitors' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('sessions')}
                  >
                    Sessions {sortKey === 'sessions' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('avgTime')}
                  >
                    Avg Time {sortKey === 'avgTime' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((page) => (
                  <tr key={page.url} className="border-b border-border last:border-0 hover:bg-[oklch(28%_0.015_60_/_0.4)] transition-colors">
                    <td className="px-4 py-3 truncate max-w-[300px]" title={page.url}>{page.url}</td>
                    <td className="px-4 py-3">{page.views.toLocaleString()}</td>
                    <td className="px-4 py-3">{page.visitors.toLocaleString()}</td>
                    <td className="px-4 py-3">{page.sessions.toLocaleString()}</td>
                    <td className="px-4 py-3">{formatTime(page.avgTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
