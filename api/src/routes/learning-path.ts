// api/src/routes/learning-path.ts
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../services/db'
import { sprints, dailyProgress, sprintStats } from '../services/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { generateSprintSlug } from '../services/llm/utils'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

const CreateSprintSchema = z.object({
  title: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  goalDescription: z.string().min(1)
})

const app = new Hono()

// Add Clerk middleware to all routes
app.use('*', clerkMiddleware())

app.post('/', async (c) => {
  try {
    const auth = getAuth(c)
    const userId = auth?.userId
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    const body = CreateSprintSchema.parse(await c.req.json())

    // Create sprint
    const [sprint] = await db
      .insert(sprints)
      .values({
        userId,
        title: body.title,
        goalDescription: body.goalDescription,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        slug: generateSprintSlug()
      })
      .returning()

    // Initialize sprint stats
    await db.insert(sprintStats).values({
      sprintId: sprint.id.toString(),
      daysWithProgress: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastProgressDate: null
    })

    return c.json({
      success: true,
      sprint: {
        ...sprint,
        stats: {
          daysWithProgress: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastProgressDate: null
        }
      }
    })
  } catch (error) {
    console.error('Failed to create sprint:', error)
    return c.json({ success: false, error: 'Failed to create sprint' }, 500)
  }
})

app.get('/:slug', async (c) => {
  try {
    const auth = getAuth(c)
    const userId = auth?.userId
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    const slug = c.req.param('slug')
    const sprint = await db.query.sprints.findFirst({
      where: and(
        eq(sprints.slug, slug),
        eq(sprints.userId, userId)
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
      return c.json({ success: false, error: 'Sprint not found' }, 404)
    }

    const response = {
      ...sprint,
      stats: {
        daysWithProgress: sprint.stats?.daysWithProgress ?? 0,
        currentStreak: sprint.stats?.currentStreak ?? 0,
        longestStreak: sprint.stats?.longestStreak ?? 0,
        lastProgressDate: sprint.stats?.lastProgressDate ?? null
      }
    }

    return c.json({ success: true, sprint: response })
  } catch (error) {
    console.error('Failed to fetch sprint:', error)
    return c.json({ success: false, error: 'Failed to fetch sprint' }, 500)
  }
})

// Get all sprints for a user
app.get('/', async (c) => {
  try {
    const auth = getAuth(c)
    const userId = auth?.userId
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    const userSprints = await db.query.sprints.findMany({
      where: eq(sprints.userId, userId),
      with: {
        stats: true,
        dailyProgress: {
          limit: 1,
          orderBy: [desc(dailyProgress.date)]
        }
      },
      orderBy: [desc(sprints.updatedAt)]
    })

    const response = userSprints.map(sprint => ({
      ...sprint,
      stats: {
        daysWithProgress: sprint.stats?.daysWithProgress ?? 0,
        currentStreak: sprint.stats?.currentStreak ?? 0,
        longestStreak: sprint.stats?.longestStreak ?? 0,
        lastProgressDate: sprint.stats?.lastProgressDate ?? null
      }
    }))

    return c.json({ success: true, sprints: response })
  } catch (error) {
    console.error('Failed to fetch sprints:', error)
    return c.json({ success: false, error: 'Failed to fetch sprints' }, 500)
  }
})

export default app