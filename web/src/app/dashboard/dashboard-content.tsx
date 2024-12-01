"use client"

import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

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
}

export function DashboardContent({ projects }: { projects: Project[] }) {
  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Link key={project.slug} href={`/projects/${project.slug}`}>
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{project.title}</h2>
                    <p className="text-muted-foreground mt-1 line-clamp-2">{project.goalDescription}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {project.status}
                  </Badge>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Days Shipped</p>
                      <p className="font-medium">{project.stats.daysShipped}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Streak</p>
                      <p className="font-medium">{project.stats.currentStreak}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Best Streak</p>
                      <p className="font-medium">{project.stats.longestStreak}</p>
                    </div>
                  </div>

                  {project.stats.lastShipDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Last shipped {format(new Date(project.stats.lastShipDate), 'MMM d')}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}