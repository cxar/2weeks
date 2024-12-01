import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardClient } from "./dashboard-client"

interface Sprint {
  id: string
  slug: string
  title: string
  startDate: string
  endDate: string
  status: string
}

async function getSprints(userId: string): Promise<Sprint[]> {
  try {
    const { getToken } = await auth()
    const token = await getToken()
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/learning-path`
    console.log('Fetching sprints from:', url)
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('API Error:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText
      })
      throw new Error(`Failed to fetch sprints: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    
    if (!data.sprints) {
      console.error('Invalid API response:', data)
      return []
    }

    return data.sprints
  } catch (error) {
    console.error('Error fetching sprints:', error)
    return [] // Return empty array instead of throwing to avoid breaking the UI
  }
}

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  const sprints = await getSprints(userId)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardClient sprints={sprints} />
      </Suspense>
    </div>
  )
}