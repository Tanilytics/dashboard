import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent } from '#/components/ui/card'
import { Filter, Github } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/dashboard/funnels')({
  component: FunnelsPage,
})

function FunnelsPage() {
  return (
    <Card className="flex flex-col items-center justify-center py-24 text-center">
      <CardContent>
        <div className="text-muted-foreground/30 mb-6">
          <Filter className="size-20 mx-auto" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-3">Funnel Analysis</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          This feature is coming in a future update. Track conversion funnels and understand how users move through your site.
        </p>
        <Button variant="outline" className="border-border gap-2" asChild>
          <Link to="/">
            <Github className="size-4" />
            Follow progress on GitHub
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
