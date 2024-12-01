"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sun, Moon, ThumbsUp, ThumbsDown, Clock } from "lucide-react"
import { format, differenceInDays } from "date-fns"

interface Project {
  id: string
  slug: string
  title: string
  goalDescription: string
  startDate: string
  endDate: string
  status: 'active' | 'paused'
  stats: {
    daysShipped: number
    currentStreak: number
    longestStreak: number
    lastShipDate: string | null
  }
  dailyProgress: Array<{
    date: Date
    shipped: string
    timeOfDay: string[]
    effectiveness: string
    reflection: string | null
  }>
}

interface ProjectDetailsProps {
  project: Project
  userId: string
}

export function ProjectDetails({ project, userId }: ProjectDetailsProps) {
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [effectiveness, setEffectiveness] = useState<string | null>(null)
  const [shipped, setShipped] = useState("")
  const [reflection, setReflection] = useState("")

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter(t => t !== time))
    } else {
      setSelectedTimes([...selectedTimes, time])
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress/${project.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`
        },
        body: JSON.stringify({
          shipped,
          timeOfDay: selectedTimes,
          effectiveness: effectiveness || 'somewhat',
          reflection
        })
      })

      if (!response.ok) {
        throw new Error("Failed to submit progress")
      }

      window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }

  const daysLeft = differenceInDays(new Date(project.endDate), new Date())
  const currentDay = project.stats.daysShipped + 1

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground mt-1">{project.goalDescription}</p>
          </div>
          <Badge variant="outline" className="capitalize">
            Day {currentDay}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Today's Progress */}
        <div className="col-span-2">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* What did you ship */}
                <div>
                  <label className="font-medium text-gray-800 block mb-2">
                    What did you ship today?
                  </label>
                  <Textarea 
                    value={shipped}
                    onChange={(e) => setShipped(e.target.value)}
                    placeholder="What did you create/complete?"
                    className="h-24 text-lg"
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">When did you work on this?</p>
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

                {/* Effectiveness */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">How effective was this session?</p>
                  <div className="flex gap-2">
                    <Button 
                      variant={effectiveness === 'very' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setEffectiveness('very')}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Very Effective
                    </Button>
                    <Button 
                      variant={effectiveness === 'somewhat' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setEffectiveness('somewhat')}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Somewhat
                    </Button>
                    <Button 
                      variant={effectiveness === 'not' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setEffectiveness('not')}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Not Really
                    </Button>
                  </div>
                </div>

                {/* Quick Reflection */}
                <div>
                  <label className="font-medium text-gray-800 block mb-2">
                    Quick reflection (optional)
                  </label>
                  <Textarea 
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="What worked? What didn't? Any insights?"
                    className="h-24"
                  />
                </div>

                <Button 
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!shipped.trim() || selectedTimes.length === 0}
                >
                  Complete Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress History */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Progress</h2>
          {project.dailyProgress?.slice(0, 5).map((progress, i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{format(new Date(progress.date), 'MMM d')}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{progress.timeOfDay.join(', ')}</span>
                </div>
              </div>
              <p className="mb-2 font-medium">{progress.shipped}</p>
              {progress.reflection && (
                <p className="text-sm text-muted-foreground">{progress.reflection}</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}