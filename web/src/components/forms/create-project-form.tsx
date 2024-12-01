"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { addDays } from "date-fns"

interface CreateProjectFormProps {
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateProjectForm({ userId, onSuccess, onCancel }: CreateProjectFormProps) {
  const router = useRouter()
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [goalDescription, setGoalDescription] = useState("")

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const startDate = new Date()
      const endDate = addDays(startDate, 14)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/learning-path`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          goalDescription,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const data = await response.json()
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/sprints/${data.sprint.slug}`)
      }
    } catch (error) {
      console.error("Failed to create sprint:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">What do you want to learn?</label>
        <Input
          placeholder="e.g., Learn React fundamentals"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">What's your goal?</label>
        <Textarea
          placeholder="Describe what you want to achieve..."
          value={goalDescription}
          onChange={(e) => setGoalDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={loading || !title.trim() || !goalDescription.trim()}>
          {loading ? "Creating..." : "Create Sprint"}
        </Button>
      </div>
    </div>
  )
} 