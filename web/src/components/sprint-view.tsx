"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { SprintDetails } from "@/components/sprint-details"

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

export function SprintView({ slug }: { slug: string }) {
  const { getToken, userId } = useAuth()
  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSprint() {
      try {
        const token = await getToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/learning-path/${slug}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await res.json()
        setSprint(data.sprint)
      } catch (error) {
        console.error("Failed to load sprint:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSprint()
  }, [slug, getToken])

  if (isLoading) return null

  if (!sprint || !userId) return <div>Sprint not found</div>

  return <SprintDetails sprint={sprint} userId={userId} />
} 