import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { TrendingUp, PieChart } from 'lucide-react'
import { useAuth } from '#/hooks/use-auth'
import { useReferrers, getLast7Days } from '#/lib/queries'

export const Route = createFileRoute('/dashboard/acquisition')({
  component: AcquisitionPage,
})

function AcquisitionPage() {
  const { currentSiteId } = useAuth()
  const { from, to } = getLast7Days()
  const { data, isLoading } = useReferrers(currentSiteId, from, to, 50)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl font-semibold tracking-tight">Top referrers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
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
                  {(data || []).map((ref) => (
                    <tr key={ref.referrer} className="border-b border-border last:border-0 hover:bg-[oklch(28%_0.015_60_/_0.4)] transition-colors">
                      <td className="px-4 py-3">{ref.referrer}</td>
                      <td className="px-4 py-3">{ref.visits.toLocaleString()}</td>
                      <td className="px-4 py-3">{ref.uniqueVisitors.toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!data || data.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No data yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placeholder cards */}
      <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <CardContent>
            <div className="text-muted-foreground/50 mb-4">
              <TrendingUp className="size-12 mx-auto" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">UTM Campaign Tracking</h3>
            <p className="text-sm text-muted-foreground">Coming in Phase 4</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <CardContent>
            <div className="text-muted-foreground/50 mb-4">
              <PieChart className="size-12 mx-auto" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Channel Breakdown</h3>
            <p className="text-sm text-muted-foreground">Direct vs Organic vs Social (Coming soon)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
