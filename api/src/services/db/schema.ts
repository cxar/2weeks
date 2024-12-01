// api/src/services/db/schema.ts
import { sql } from "drizzle-orm"
import { 
  text,
  integer,
  timestamp,
  pgTable,
  jsonb,
  uuid,
  pgEnum,
  serial
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const sprintStatusEnum = pgEnum('sprint_status', ['active', 'paused'])
export const timeOfDayEnum = pgEnum('time_of_day', ['morning', 'afternoon', 'evening'])
export const effectivenessEnum = pgEnum('effectiveness', ['very', 'somewhat', 'not'])
export const adjustmentTypeEnum = pgEnum('adjustment_type', ['continue', 'refine', 'pivot'])

export const sprints = pgTable('sprints', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  goalDescription: text('goal_description').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: sprintStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const sprintRelations = relations(sprints, ({ one, many }) => ({
  stats: one(sprintStats, {
    fields: [sprints.id],
    references: [sprintStats.sprintId],
  }),
  dailyProgress: many(dailyProgress),
  insights: many(sprintInsights)
}))

export const dailyProgress = pgTable('daily_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  sprintId: uuid('sprint_id').references(() => sprints.id).notNull(),
  progress: text('progress').notNull(),
  timeOfDay: jsonb('time_of_day').$type<string[]>().notNull(),
  effectiveness: effectivenessEnum('effectiveness').notNull(),
  reflection: text('reflection'),
  date: timestamp('date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const dailyProgressRelations = relations(dailyProgress, ({ one }) => ({
  sprint: one(sprints, {
    fields: [dailyProgress.sprintId],
    references: [sprints.id],
  })
}))

export const sprintStats = pgTable('sprint_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  sprintId: uuid('sprint_id').references(() => sprints.id).notNull(),
  daysWithProgress: integer('days_with_progress').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastProgressDate: timestamp('last_progress_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const sprintStatsRelations = relations(sprintStats, ({ one }) => ({
  sprint: one(sprints, {
    fields: [sprintStats.sprintId],
    references: [sprints.id],
  })
}))

export const sprintInsights = pgTable('sprint_insights', {
  id: uuid('id').defaultRandom().primaryKey(),
  sprintId: uuid('sprint_id').references(() => sprints.id).notNull(),
  patterns: jsonb('patterns').$type<string[]>().notNull(),
  adjustmentType: adjustmentTypeEnum('adjustment_type').notNull(),
  rationale: text('rationale').notNull(),
  suggestedActions: jsonb('suggested_actions').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const sprintInsightsRelations = relations(sprintInsights, ({ one }) => ({
  sprint: one(sprints, {
    fields: [sprintInsights.sprintId],
    references: [sprints.id],
  })
}))