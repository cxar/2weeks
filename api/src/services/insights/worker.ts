import { db } from '../db'
import { sprints, dailyProgress, sprintInsights } from '../db/schema'
import { and, eq, lte } from 'drizzle-orm'
import { generateAIInsights } from '../llm/utils'
import { addDays } from 'date-fns'

interface ProjectProgress {
  date: Date
  shipped: string
  timeOfDay: string[]
  effectiveness: 'very' | 'somewhat' | 'not'
  reflection: string | null
}

interface ProjectInsight {
  patterns: string[]
  adjustments: {
    type: 'continue' | 'refine' | 'pivot'
    rationale: string
    suggestedActions: string[]
  }
}

export async function analyzeProjectProgress(sprintId: string): Promise<ProjectInsight> {
  try {
    // Get project details
    const sprint = await db.query.sprints.findFirst({
      where: eq(sprints.id, parseInt(sprintId)),
      with: {
        dailyProgress: true,
        stats: true
      }
    })

    if (!sprint) {
      throw new Error('Project not found')
    }

    // Get all progress entries
    const progressEntries = await db
      .select({
        date: dailyProgress.date,
        shipped: dailyProgress.shipped,
        timeOfDay: dailyProgress.timeOfDay,
        effectiveness: dailyProgress.effectiveness,
        reflection: dailyProgress.reflection
      })
      .from(dailyProgress)
      .where(eq(dailyProgress.sprintId, sprintId))

    // Generate insights using AI
    const aiInsights = await generateAIInsights({
      title: sprint.title,
      goalDescription: sprint.goalDescription
    }, progressEntries as ProjectProgress[])

    // Save insights to database
    await db.insert(sprintInsights).values({
      sprintId,
      patterns: aiInsights.detectedPatterns,
      adjustmentType: aiInsights.suggestedAdjustments.type,
      rationale: aiInsights.suggestedAdjustments.rationale,
      suggestedActions: aiInsights.suggestedAdjustments.suggestedActions
    })

    return {
      patterns: aiInsights.detectedPatterns,
      adjustments: aiInsights.suggestedAdjustments
    }
  } catch (error) {
    console.error('Failed to analyze project progress:', error)
    throw error
  }
} 