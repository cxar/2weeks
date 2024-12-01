import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const BaseObjectiveSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['project', 'practice', 'research']),
  dependencies: z.array(z.string()),
  priority: z.number().min(1).max(10),
  concepts: z.array(z.string()),
  estimatedHours: z.number()
})

const EnrichedObjectiveSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['project', 'practice', 'research']),
  estimatedHours: z.number(),
  dependencies: z.array(z.string()),
  priority: z.number().min(1).max(10),
  concepts: z.array(z.string()),
  activityDetails: z.object({
    overview: z.string(),
    gettingStarted: z.array(z.string()),
    keyMilestones: z.array(z.string()),
    commonChallenges: z.array(z.string()),
    timeBreakdown: z.array(z.object({
      phase: z.string(),
      hours: z.number(),
      description: z.string()
    }))
  }),
  reflectionPrompts: z.array(z.string())
})

const InitialDecompositionSchema = z.object({
  objectives: z.array(BaseObjectiveSchema),
  prerequisiteKnowledge: z.array(z.string())
})

const FinalDecompositionSchema = z.object({
  objectives: z.array(EnrichedObjectiveSchema),
  totalEstimatedHours: z.number(),
  prerequisiteKnowledge: z.array(z.string())
})

const createPathSchema = z.object({
  userId: z.string(),
  topic: z.string(),
  hoursPerDay: z.number().min(0.1).max(24),
  level: z.enum(['beginner', 'intermediate', 'expert']),
})

async function enrichObjective(
  objective: z.infer<typeof BaseObjectiveSchema>, 
  topic: string, 
  level: string,
  allocatedHours: number
) {
  const systemPrompt = `You are an expert at breaking down learning goals into specific, actionable tasks.
Your task is to create a concrete activity with clear deliverables.

CRITICAL CONSTRAINTS:
- This objective MUST fit within exactly ${allocatedHours} hours
- All timeBreakdown phases MUST sum to exactly ${allocatedHours} hours
- Activities MUST be completable within a ${allocatedHours}-hour timeframe
- Each activity MUST have a clear, tangible output or deliverable

For "practice" types: Include specific exercises with example problems
For "project" types: Include specific things to build or create
For "research" types: Include specific topics to investigate and outputs to create

The response MUST be VALID JSON matching this structure:
{
  "id": "string",
  "title": "string",
  "description": "string (specific task to complete, not just concepts to learn)",
  "type": "project" | "practice" | "research",
  "estimatedHours": number,
  "dependencies": string[],
  "priority": number,
  "concepts": string[],
  "activityDetails": {
    "overview": "string (what you will DO and what you will PRODUCE)",
    "gettingStarted": string[] (specific first actions to take),
    "keyMilestones": string[] (specific outputs or deliverables to create),
    "commonChallenges": string[] (specific problems and their solutions),
    "timeBreakdown": [
      {
        "phase": "string (name of phase)",
        "hours": number (estimated hours),
        "description": "string (specific actions to take in this phase)"
      }
    ]
  },
  "reflectionPrompts": string[] (specific questions about what you produced)
}`

  const userPrompt = `Create a specific, actionable task for learning about "${topic}" at ${level} level:

Current objective:
${JSON.stringify(objective, null, 2)}

Requirements:
1. Task must have clear deliverables (e.g., "Write a 500-word analysis of...", "Create a flowchart showing...", "Build a working prototype of...")
2. Instructions must be specific enough that someone could start immediately
3. Each time block must have concrete actions, not just "learn about X"
4. Include example problems or specifications where relevant
5. Focus on DOING rather than just reading or watching

Make it:
- Immediately actionable (no preparation needed)
- Self-contained (all resources specified)
- Clearly measurable (obvious when complete)
- Focused on producing something specific`

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7
  })

  const enriched = JSON.parse(response.choices[0].message.content || '{}')
  return enriched
}

export async function decomposeGoal(topic: string, hoursPerDay: number, level: string) {
  const totalAvailableHours = hoursPerDay
  
  // Calculate optimal objective sizes based on available time
  const timeBlocks = calculateTimeBlocks(totalAvailableHours, hoursPerDay)
  
  const initialSystemPrompt = `You are an expert curriculum designer.
Your task is to break down a learning goal into objectives that can be completed in ${hoursPerDay} hours per day.

Available objective types:
- "project": Hands-on building of something concrete (combines project and skill-building)
- "practice": Focused exercises and practical application
- "research": Deep learning and exploration of concepts (combines research and exploration)

CRITICAL CONSTRAINTS:
1. Total time must fill ${hoursPerDay} hours per day for 14 days
2. Each individual objective should be completable in one sitting
3. Priority (1-10) indicates dependency order:
   - Use lower numbers (1-3) for foundational skills that others depend on
   - Use middle numbers (4-7) for intermediate skills
   - Use higher numbers (8-10) for advanced skills
   - Skills at the same level can share the same priority

The response MUST be VALID JSON with this EXACT structure:
{
  "objectives": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "type": "project" | "practice" | "research",
      "dependencies": ["string"],
      "priority": number (1-10, based on dependency order),
      "concepts": ["string"],
      "estimatedHours": number (should be completable in one sitting)
    }
  ],
  "prerequisiteKnowledge": ["string"]
}

CRITICAL: 
- Both "objectives" and "prerequisiteKnowledge" arrays MUST be present and non-empty
- Total hours across all objectives MUST equal ${hoursPerDay * 14}
- Each priority value MUST be between 1 and 10
- Objectives with same-level dependencies can share priority numbers

The objectives must:
1. Be completable within a single sitting
2. Build upon each other logically
3. Cover the full available time of ${hoursPerDay * 14} hours`

  const initialUserPrompt = `Create a diverse learning path for: ${topic}

Available time: ${totalAvailableHours} hours (${hoursPerDay} hours/day for 14 days)
Target depth: ${level} (where beginner is 1, intermediate is 2, and expert is 3)

Include a balanced mix of:
- Projects: Building real things to apply knowledge
- Practice: Hands-on exercises to reinforce skills
- Research: Learning and exploring concepts deeply

Ensure objectives:
1. Build upon each other
2. Are self-contained and achievable
3. Cover different aspects of learning
4. Allow for self-guided progress`

  const initialResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: initialSystemPrompt },
      { role: "user", content: initialUserPrompt }
    ],
    temperature: 0.7
  })

  const initialDecomposition = JSON.parse(initialResponse.choices[0].message.content || '{}')
  const validatedInitial = InitialDecompositionSchema.parse(initialDecomposition)

  // Stage 2: Enrich each objective with details
  const enrichedObjectives = await Promise.all(
    validatedInitial.objectives.map(obj => enrichObjective(obj, topic, level, obj.estimatedHours))
  )

  const totalHours = enrichedObjectives.reduce((sum, obj) => sum + obj.estimatedHours, 0)

  const finalDecomposition = {
    objectives: enrichedObjectives,
    totalEstimatedHours: totalHours,
    prerequisiteKnowledge: validatedInitial.prerequisiteKnowledge
  }

  return FinalDecompositionSchema.parse(finalDecomposition)
}

function calculateTimeBlocks(totalHours: number, hoursPerDay: number): number[] {
  const blocks: number[] = []
  let remainingHours = totalHours

  while (remainingHours > 0) {
    let blockSize = Math.min(
      remainingHours,
      hoursPerDay, // Max 1-day block
      Math.max(0.5, remainingHours / 3) // Prefer smaller blocks
    )
    
    blockSize = Math.round(blockSize * 2) / 2
    blocks.push(blockSize)
    remainingHours -= blockSize
  }

  return blocks
}
