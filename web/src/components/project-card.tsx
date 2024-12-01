"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SprintCardProps {
  project: {
    slug: string
    title: string
    startDate: string
    endDate: string
    status: string
  }
}

export function ProjectCard({ project }: SprintCardProps) {
  const startDate = new Date(project.startDate)
  const endDate = new Date(project.endDate)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "planning":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in_progress":
        return "In Progress"
      case "planning":
        return "Planning"
      default:
        return status
    }
  }

  return (
    <Link href={`/projects/${project.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-2">{project.title}</CardTitle>
            <Badge className={getStatusColor(project.status)} variant="secondary">
              {getStatusLabel(project.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Start Date</p>
              <p>{format(startDate, "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">End Date</p>
              <p>{format(endDate, "MMM d, yyyy")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 