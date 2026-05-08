import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import { useAuth } from '#/hooks/use-auth'
import { usePages, getLast7Days } from '#/lib/queries'

export const Route = createFileRoute('/dashboard/pages')({
  component: PagesPage,
})

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function PagesPage() {
  const { currentSiteId } = useAuth()
  const { from, to } = getLast7Days()
  const { data, isLoading } = usePages(currentSiteId, from, to, 50)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'views' | 'uniqueVisitors' | 'uniqueSessions' | 'avgTimeOnPageSeconds'>('views')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    let list = data || []
    if (search) {
      list = list.filter((p) => p.url.toLowerCase().includes(search.toLowerCase()))
    }
    list = [...list].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey]
      return sortDir === 'asc' ? diff : -diff
    })
    return list
  }, [data, search, sortKey, sortDir])

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
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-muted-foreground mb-4">
              {search ? `No pages found matching "${search}"` : 'No data yet'}
            </div>
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
                    onClick={() => toggleSort('uniqueVisitors')}
                  >
                    Visitors {sortKey === 'uniqueVisitors' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('uniqueSessions')}
                  >
                    Sessions {sortKey === 'uniqueSessions' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('avgTimeOnPageSeconds')}
                  >
                    Avg Time {sortKey === 'avgTimeOnPageSeconds' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((page) => (
                  <tr key={page.url} className="border-b border-border last:border-0 hover:bg-[oklch(28%_0.015_60_/_0.4)] transition-colors">
                    <td className="px-4 py-3 truncate max-w-[300px]" title={page.url}>{page.url}</td>
                    <td className="px-4 py-3">{page.views.toLocaleString()}</td>
                    <td className="px-4 py-3">{page.uniqueVisitors.toLocaleString()}</td>
                    <td className="px-4 py-3">{page.uniqueSessions.toLocaleString()}</td>
                    <td className="px-4 py-3">{formatTime(page.avgTimeOnPageSeconds)}</td>
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
