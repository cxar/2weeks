"use client"

import { SprintCard } from "@/components/sprint-card"

interface Sprint {
  id: string
  slug: string
  title: string
  startDate: string
  endDate: string
  status: string
}

interface DashboardClientProps {
  sprints: Sprint[]
}

export function DashboardClient({ sprints }: DashboardClientProps) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Learning Sprints</h1>
      </div>

      {sprints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No learning sprints yet. Create your first one using the button in the top navigation.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sprints.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} />
          ))}
        </div>
      )}
    </>
  )
} 