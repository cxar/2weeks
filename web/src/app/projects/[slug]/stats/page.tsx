import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { Brain, Clock, Flame, Target, ThumbsUp } from "lucide-react"

interface TimeOfDayStats {
  timeOfDay: string
  count: number
  effectiveRate: number
}

interface ProjectStats {
  daysShipped: number
  currentStreak: number
  longestStreak: number
  lastShipDate: Date | null
  timeOfDay: TimeOfDayStats[]
  recentProgress: Array<{
    date: Date
    shipped: string
    timeOfDay: string[]
    effectiveness: 'very' | 'somewhat' | 'not'
    reflection: string | null
  }>
  latestInsight: {
    patterns: string[]
    adjustment: {
      type: 'continue' | 'refine' | 'pivot'
      rationale: string
      suggestedActions: string[]
    }
    createdAt: Date
  } | null
}

async function getProjectStats(slug: string): Promise<ProjectStats> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/${slug}`, {
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_USER_ID}`
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.stats
}

export default async function StatsPage({ params }: { params: { slug: string } }) {
  const stats = await getProjectStats(params.slug)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-muted-foreground">Days Shipped</h3>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.daysShipped}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.currentStreak}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium text-muted-foreground">Best Streak</h3>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.longestStreak}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-medium text-muted-foreground">Last Ship</h3>
            </div>
            <p className="text-lg font-medium mt-1">
              {stats.lastShipDate ? format(new Date(stats.lastShipDate), 'MMM d') : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time of Day Analysis */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Time of Day Analysis</h2>
          <div className="space-y-4">
            {stats.timeOfDay.map(tod => (
              <div key={tod.timeOfDay} className="flex items-center gap-4">
                <div className="w-24 font-medium">{tod.timeOfDay}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${tod.effectiveRate}%` }}
                    />
                  </div>
                </div>
                <div className="w-32 text-sm text-muted-foreground">
                  {tod.count} sessions ({tod.effectiveRate}% effective)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Latest AI Insight */}
      {stats.latestInsight && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Brain className="h-5 w-5 text-purple-500" />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800">Learning Patterns</h3>
                  <ul className="mt-2 space-y-1">
                    {stats.latestInsight.patterns.map((pattern, i) => (
                      <li key={i} className="text-sm text-gray-600">• {pattern}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Recommended Adjustment</h3>
                  <p className="text-sm text-gray-600 mt-1">{stats.latestInsight.adjustment.rationale}</p>
                  <ul className="mt-2 space-y-1">
                    {stats.latestInsight.adjustment.suggestedActions.map((action, i) => (
                      <li key={i} className="text-sm text-gray-600">• {action}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-gray-500">
                  Generated {format(new Date(stats.latestInsight.createdAt), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Progress */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Progress</h2>
          <div className="space-y-6">
            {stats.recentProgress.map((progress, i) => (
              <div key={i} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{format(new Date(progress.date), 'MMM d')}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{progress.timeOfDay.join(', ')}</span>
                  </div>
                </div>
                <p className="mb-2">{progress.shipped}</p>
                {progress.reflection && (
                  <p className="text-sm text-muted-foreground">{progress.reflection}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 