import { Hono } from 'hono'
import { z } from "zod"
import { eq, and, desc } from "drizzle-orm"
import { db } from "../services/db"
import { sprints, dailyProgress, sprintStats } from "../services/db/schema"
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

const timeOfDayEnum = z.enum(["morning", "afternoon", "evening"])
const effectivenessEnum = z.enum(["very", "somewhat", "not"])

const progressSchema = z.object({
  progress: z.string().min(1),
  timeOfDay: z.array(timeOfDayEnum).min(1),
  effectiveness: effectivenessEnum,
  reflection: z.string().optional()
})

const app = new Hono()

app.use('*', clerkMiddleware())

// Get project progress
app.get('/:sprintId', async (c) => {
  const auth = getAuth(c)
  if (!auth) return c.json({ error: "Unauthorized" }, 401)
  if (!auth.userId) return c.json({ error: "Unauthorized" }, 401)

  const sprintId = c.req.param('sprintId')

  try {
    const sprint = await db.query.sprints.findFirst({
      where: and(
        eq(sprints.id, sprintId),
        eq(sprints.userId, auth.userId)
      ),
      with: {
        dailyProgress: {
          orderBy: [desc(dailyProgress.date)],
          limit: 14
        },
        stats: true
      }
    })

    if (!sprint) {
      return c.json({ error: "Project not found" }, 404)
    }

    return c.json(sprint)
  } catch (error) {
    console.error('Failed to fetch project progress:', error)
    return c.json({ error: 'Failed to fetch project progress' }, 500)
  }
})

// Add daily progress
app.post('/:sprintId', async (c) => {
  const auth = getAuth(c)
  if (!auth) return c.json({ error: "Unauthorized" }, 401)
  if (!auth.userId) return c.json({ error: "Unauthorized" }, 401)

  try {
    const sprintId = c.req.param('sprintId')
    const body = progressSchema.parse(await c.req.json())

    // Check sprint exists and user owns it
    const sprint = await db.query.sprints.findFirst({
      where: and(
        eq(sprints.id, sprintId),
        eq(sprints.userId, auth.userId)
      )
    })

    if (!sprint) {
      throw new Error("Sprint not found or not authorized")
    }

    // Add progress entry
    const [progress] = await db.insert(dailyProgress).values({
      sprintId,
      progress: body.progress,
      timeOfDay: body.timeOfDay,
      effectiveness: body.effectiveness,
      reflection: body.reflection,
      date: new Date()
    }).returning()

    // Update sprint stats
    const stats = await db.query.sprintStats.findFirst({
      where: eq(sprintStats.sprintId, sprintId)
    })

    if (!stats) {
      await db.insert(sprintStats).values({
        sprintId,
        daysWithProgress: 1,
        currentStreak: 1,
        longestStreak: 1,
        lastProgressDate: new Date()
      })
    } else {
      const lastDate = stats.lastProgressDate ? new Date(stats.lastProgressDate) : null
      const today = new Date()
      const isConsecutive = lastDate && 
        today.getDate() - lastDate.getDate() === 1

      await db.update(sprintStats)
        .set({
          daysWithProgress: stats.daysWithProgress + 1,
          currentStreak: isConsecutive ? stats.currentStreak + 1 : 1,
          longestStreak: isConsecutive ? 
            Math.max(stats.longestStreak, stats.currentStreak + 1) : 
            stats.longestStreak,
          lastProgressDate: today,
          updatedAt: new Date()
        })
        .where(eq(sprintStats.sprintId, sprintId))
    }

    return c.json({ success: true, progress })
  } catch (error) {
    console.error('Failed to record progress:', error)
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: 'Failed to record progress' }, 500)
  }
})

export default app