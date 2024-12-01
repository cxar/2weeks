import { addDays } from "date-fns"

interface DailyPlan {
  day: number
  previousDay?: {
    shipped: string
    whatWorked: string
    patterns: string[]
  }
  today: {
    suggestedFocus?: string
    timeCommitment: number
  }
}

interface DailyReflection {
  shipped: string
  timeSpent: number
  reflection: {
    whatWorked: string
    challenges: string
    nextSteps: string
  }
}

export function generateInitialPlan({
  title,
  goalDescription,
  finalDeliverable,
  startDate,
  endDate,
  timePerDay
}: {
  title: string
  goalDescription: string
  finalDeliverable: string
  startDate: Date
  endDate: Date
  timePerDay: number
}) {
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Create a simple daily structure focused on time commitment
  const plans: DailyPlan[] = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    today: {
      timeCommitment: timePerDay
    }
  }))

  // Add only essential milestone markers
  const milestones = [
    { day: 1, focus: "Get started with your first small step" },
    { day: totalDays, focus: finalDeliverable }
  ]

  milestones.forEach(({ day, focus }) => {
    if (plans[day - 1]) {
      plans[day - 1].today.suggestedFocus = focus
    }
  })

  return plans
}

// Helper function to analyze patterns in reflections
export function analyzePatterns(reflections: DailyReflection[]): string[] {
  if (reflections.length === 0) return []

  const patterns: string[] = []
  const lastReflection = reflections[reflections.length - 1]

  // Look for time-based patterns
  const averageTimeSpent = reflections.reduce((sum, r) => sum + r.timeSpent, 0) / reflections.length
  if (lastReflection.timeSpent > averageTimeSpent) {
    patterns.push("You're more productive with longer focused sessions")
  }

  // Look for successful strategies
  const commonSuccesses = reflections
    .map(r => r.reflection.whatWorked.toLowerCase())
    .reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  Object.entries(commonSuccesses)
    .filter(([_, count]) => count > 1)
    .forEach(([strategy]) => {
      patterns.push(`This approach works well for you: ${strategy}`)
    })

  return patterns
}

// Helper function to generate next day's suggestion
export function generateSuggestion(
  reflections: DailyReflection[],
  patterns: string[]
): string {
  if (reflections.length === 0) return "Start with something small and concrete"

  const lastReflection = reflections[reflections.length - 1]
  
  // If yesterday was successful, suggest building on that
  if (lastReflection.shipped && lastReflection.reflection.whatWorked) {
    return `Consider building on what worked yesterday: ${lastReflection.reflection.whatWorked}`
  }

  // If facing challenges, suggest a different approach
  if (lastReflection.reflection.challenges) {
    return `Try a new approach to address yesterday's challenge`
  }

  // Default to a momentum-focused suggestion
  return "Focus on shipping something concrete today"
}