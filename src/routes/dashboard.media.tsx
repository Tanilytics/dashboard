import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { PlayCircle, Headphones } from 'lucide-react'

const mediaData = [
  { mediaUrl: '/video/tutorial-1', mediaType: 'video' as const, plays: 1204, completions: 938, viewers: 892, avgCompletionRate: 0.78 },
  { mediaUrl: '/podcast/ep-42', mediaType: 'audio' as const, plays: 892, completions: 570, viewers: 543, avgCompletionRate: 0.64 },
  { mediaUrl: '/video/intro', mediaType: 'video' as const, plays: 654, completions: 294, viewers: 278, avgCompletionRate: 0.45 },
  { mediaUrl: '/podcast/ep-41', mediaType: 'audio' as const, plays: 543, completions: 380, viewers: 421, avgCompletionRate: 0.70 },
  { mediaUrl: '/video/deep-dive', mediaType: 'video' as const, plays: 321, completions: 96, viewers: 198, avgCompletionRate: 0.30 },
]

function CompletionBar({ rate }: { rate: number }) {
  const color = rate > 0.75 ? 'bg-[oklch(65%_0.14_145)]' : rate > 0.5 ? 'bg-[oklch(70%_0.12_80)]' : 'bg-muted-foreground'
  return (
    <div className="h-1.5 bg-border rounded-full overflow-hidden w-full max-w-[120px]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${rate * 100}%` }} />
    </div>
  )
}

export const Route = createFileRoute('/dashboard/media')({
  component: MediaPage,
})

function MediaPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl font-semibold tracking-tight">Media analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Media</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Plays</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Completions</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Viewers</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Completion</th>
                </tr>
              </thead>
              <tbody>
                {mediaData.map((item) => (
                  <tr key={item.mediaUrl} className="border-b border-border last:border-0 hover:bg-[oklch(28%_0.015_60_/_0.4)] transition-colors">
                    <td className="px-4 py-3 truncate max-w-[250px]" title={item.mediaUrl}>{item.mediaUrl}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.mediaType === 'video'
                          ? 'bg-[oklch(58%_0.16_35_/_0.12)] text-primary'
                          : 'bg-[oklch(55%_0.12_250_/_0.12)] text-[oklch(65%_0.14_250)]'
                      }`}>
                        {item.mediaType === 'video' ? <PlayCircle className="size-3" /> : <Headphones className="size-3" />}
                        {item.mediaType}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.plays.toLocaleString()}</td>
                    <td className="px-4 py-3">{item.completions.toLocaleString()}</td>
                    <td className="px-4 py-3">{item.viewers.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CompletionBar rate={item.avgCompletionRate} />
                        <span className="text-xs text-muted-foreground w-10">{Math.round(item.avgCompletionRate * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder cards */}
      <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <CardContent>
            <div className="text-muted-foreground/50 mb-4">
              <PlayCircle className="size-12 mx-auto" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Engagement Timeline</h3>
            <p className="text-sm text-muted-foreground">Coming in Phase 3</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <CardContent>
            <div className="text-muted-foreground/50 mb-4">
              <Headphones className="size-12 mx-auto" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Drop-off Curve</h3>
            <p className="text-sm text-muted-foreground">Coming in Phase 4</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
