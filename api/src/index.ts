import { Hono } from 'hono'
import type { MiddlewareHandler } from 'hono'
import { cors } from 'hono/cors'
import learningPathRoutes from './routes/learning-path'
import progressRoutes from './routes/progress'
import statsRoutes from './routes/stats'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(__dirname, '../.env') })

const app = new Hono()

// Middlewares
app.use('/*', cors() as unknown as MiddlewareHandler<any, string, {}>)

// Routes
app.route('/api/learning-path', learningPathRoutes)
app.route('/api/progress', progressRoutes)
app.route('/api/stats', statsRoutes)

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

export default {
  port: 3001,
  fetch: app.fetch,
}