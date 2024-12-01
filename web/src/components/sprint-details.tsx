"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sun, Moon } from "lucide-react"
import { useAuth } from "@clerk/nextjs"

interface Sprint {
  id: string
  slug: string
  title: string
  goalDescription: string
  startDate: string
  endDate: string
  status: 'active' | 'paused'
  stats: {
    daysWithProgress: number
    currentStreak: number
    longestStreak: number
    lastProgressDate: string | null
  }
  dailyProgress: Array<{
    date: Date
    progress: string
    timeOfDay: string[]
    effectiveness: string
    reflection: string | null
  }>
}

interface SprintDetailsProps {
  sprint: Sprint
  userId: string
}

export function SprintDetails({ sprint, userId }: SprintDetailsProps) {
  const { getToken } = useAuth()
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [effectiveness, setEffectiveness] = useState<string | null>(null)
  const [progress, setProgress] = useState("")
  const [reflection, setReflection] = useState("")

  const toggleTime = (time: string) => {
    setSelectedTimes(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    )
  }

  const handleSubmit = async () => {
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress/${sprint.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          progress,
          timeOfDay: selectedTimes,
          effectiveness: effectiveness || 'somewhat',
          reflection
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      window.location.reload()
    } catch (error) {
      console.error('Failed to submit progress:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{sprint.title}</h1>
          <Badge variant="secondary">Day {sprint.stats.daysWithProgress + 1}</Badge>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">{sprint.stats.currentStreak}</div>
          <div className="text-sm text-gray-600">day streak</div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block font-medium mb-2">
            What progress did you make today?
          </label>
          <Textarea 
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            placeholder="What did you accomplish? What steps did you take?"
            className="h-32 resize-none"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">When did you work?</label>
          <div className="flex gap-2">
            <Button 
              variant={selectedTimes.includes('morning') ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => toggleTime('morning')}
            >
              <Sun className="h-4 w-4 mr-2" />
              Morning
            </Button>
            <Button 
              variant={selectedTimes.includes('afternoon') ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => toggleTime('afternoon')}
            >
              <Sun className="h-4 w-4 mr-2" />
              Afternoon
            </Button>
            <Button 
              variant={selectedTimes.includes('evening') ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => toggleTime('evening')}
            >
              <Moon className="h-4 w-4 mr-2" />
              Evening
            </Button>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">How was your flow?</label>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={effectiveness === 'very' ? 'default' : 'outline'}
              onClick={() => setEffectiveness('very')}
            >
              🚀 Deep flow
            </Button>
            <Button 
              variant={effectiveness === 'somewhat' ? 'default' : 'outline'}
              onClick={() => setEffectiveness('somewhat')}
            >
              💪 Steady
            </Button>
            <Button 
              variant={effectiveness === 'not' ? 'default' : 'outline'}
              onClick={() => setEffectiveness('not')}
            >
              🤔 Stuck
            </Button>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">Quick reflection</label>
          <Textarea 
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What worked well? What could be better tomorrow?"
            className="h-24 resize-none"
          />
        </div>

        <Button 
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!progress.trim() || selectedTimes.length === 0}
        >
          Complete Entry
        </Button>

        {sprint.dailyProgress?.length > 0 && (
          <div className="border-t pt-8">
            <h2 className="font-medium mb-4">Recent progress</h2>
            <div className="space-y-4">
              {sprint.dailyProgress.slice(0, 5).map((progress, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">
                      {new Date(progress.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-gray-600">{progress.timeOfDay.join(', ')}</span>
                  </div>
                  <p className="mb-2">{progress.progress}</p>
                  {progress.reflection && (
                    <p className="text-sm text-gray-600">{progress.reflection}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 