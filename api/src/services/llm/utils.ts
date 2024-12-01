export function generateSprintSlug(): string {
  return Math.random().toString(36).substring(2, 8);
}

export async function generateAIInsights(sprint: { title: string, goalDescription: string }, progressEntries: any[]) {
  // TODO: Implement actual AI insights generation
  return {
    detectedPatterns: [],
    suggestedAdjustments: {
      type: 'continue' as const,
      rationale: 'Not implemented yet',
      suggestedActions: []
    }
  }
}
