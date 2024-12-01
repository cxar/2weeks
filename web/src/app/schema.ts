import { sql } from "drizzle-orm"
import { 
  text,
  integer,
  timestamp,
  pgTable,
  boolean,
  json,
  primaryKey,
  uuid,
  pgEnum
} from "drizzle-orm/pg-core"

export const projectStatusEnum = pgEnum('project_status', ['active', 'paused'])
export const timeOfDayEnum = pgEnum('time_of_day', ['morning', 'afternoon', 'evening'])
export const effectivenessEnum = pgEnum('effectiveness', ['very', 'somewhat', 'not'])

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  goalDescription: text('goal_description').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: projectStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const dailyProgress = pgTable('daily_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  shipped: text('shipped').notNull(),
  timeOfDay: json('time_of_day').$type<string[]>().notNull(),
  effectiveness: effectivenessEnum('effectiveness').notNull(),
  reflection: text('reflection'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const projectStats = pgTable('project_stats', {
  projectId: uuid('project_id').references(() => projects.id).primaryKey(),
  daysShipped: integer('days_shipped').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastShipDate: timestamp('last_ship_date'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}) 