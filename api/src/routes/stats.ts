import { Hono } from 'hono'
import { eq, and, desc } from "drizzle-orm"
import { db } from "../services/db"
import { sprints, dailyProgress, sprintStats, sprintInsights } from "../services/db/schema"

const app = new Hono()

app.get('/:sprintId', async (c) => {
  const sprintId = c.req.param('sprintId')
  const userId = c.req.header('Authorization')?.replace('Bearer ', '')

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  // Verify sprint ownership
  const sprint = await db.query.sprints.findFirst({
    where: and(
      eq(sprints.id, sprintId),
      eq(sprints.userId, userId)
    ),
    with: {
      stats: true,
      dailyProgress: {
        orderBy: [desc(dailyProgress.date)],
        limit: 14
      },
      insights: {
        orderBy: [desc(sprintInsights.createdAt)],
        limit: 1
      }
    }
  })

  if (!sprint) {
    return c.json({ error: "Sprint not found" }, 404)
  }

  // Calculate time of day effectiveness
  const timePreferences = sprint.dailyProgress.reduce((acc, p) => {
    p.timeOfDay.forEach(time => {
      if (!acc[time]) acc[time] = { count: 0, effective: 0 }
      acc[time].count++
      if (p.effectiveness === 'very') acc[time].effective++
    })
    return acc
  }, {} as Record<string, { count: number; effective: number }>)

  const timeOfDayStats = Object.entries(timePreferences).map(([timeOfDay, stats]) => ({
    timeOfDay,
    count: stats.count,
    effectiveRate: Math.round((stats.effective / stats.count) * 100)
  }))

  return c.json({
    success: true,
    stats: {
      daysShipped: sprint.stats?.daysWithProgress ?? 0,
      currentStreak: sprint.stats?.currentStreak ?? 0,
      longestStreak: sprint.stats?.longestStreak ?? 0,
      lastShipDate: sprint.stats?.lastProgressDate ?? null,
      timeOfDay: timeOfDayStats,
      recentProgress: sprint.dailyProgress.map(p => ({
        date: p.date,
        shipped: p.progress,
        timeOfDay: p.timeOfDay,
        effectiveness: p.effectiveness,
        reflection: p.reflection
      })),
      latestInsight: sprint.insights[0] ? {
        patterns: sprint.insights[0].patterns,
        adjustment: {
          type: sprint.insights[0].adjustmentType,
          rationale: sprint.insights[0].rationale,
          suggestedActions: sprint.insights[0].suggestedActions
        },
        createdAt: sprint.insights[0].createdAt
      } : null
    }
  })
})

export default app 