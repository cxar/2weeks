import { db } from '../db'
import { sprints } from '../db/schema'
import { eq } from 'drizzle-orm'
import { analyzeProjectProgress } from './worker'

const INSIGHTS_INTERVAL = process.env.INSIGHTS_INTERVAL_MS || 1000 * 60 * 60 // Default: every hour

export async function runInsightsAnalysis() {
  try {
    // Get all active sprints
    const activeSprints = await db.query.sprints.findMany({
      where: eq(sprints.status, 'active')
    })

    console.log(`Analyzing ${activeSprints.length} active sprints`)

    for (const sprint of activeSprints) {
      try {
        const insights = await analyzeProjectProgress(sprint.id.toString())
        console.log(`Generated insights for sprint ${sprint.id}:`, insights)
      } catch (error) {
        console.error(`Failed to analyze sprint ${sprint.id}:`, error)
      }
    }
  } catch (error) {
    console.error('Failed to run insights analysis:', error)
  }
}

// Start the insights runner
export function startInsightsRunner() {
  console.log('Starting insights runner with interval:', INSIGHTS_INTERVAL)
  setInterval(runInsightsAnalysis, Number(INSIGHTS_INTERVAL))
  // Run immediately on start
  runInsightsAnalysis()
} 