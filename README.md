# Learning Sprint Framework

A framework for structuring 2-week learning sprints with daily shipping goals.

## Core Concepts & Terminology

### Learning Sprint
The primary unit of learning in our system. A Learning Sprint:
- Is a 2-week focused period for learning a specific topic
- Has a clear title describing what you want to learn
- Requires shipping something tangible every day
- Has a defined start and end date
- Can be in one of three states: planning, in_progress, or completed

### Daily Ship
A tangible output that demonstrates what you learned that day. This could be:
- Code you wrote
- Blog post you created
- Project you built
- Documentation you wrote
- Video you recorded
- Any other concrete evidence of learning

### Status
A Learning Sprint can be in one of these states:
- `planning`: Sprint is created but hasn't started yet
- `in_progress`: Sprint is currently active
- `completed`: Sprint has ended

### Terminology Mapping
To maintain consistency throughout the codebase and UI:
- Use "Learning Sprint" or "Sprint" (not "Project" or "Path")
- Use "Daily Ship" (not "Deliverable" or "Output")
- Use "Create Sprint" (not "Start Project" or "Begin Learning")

## File Structure
- `/web` - Frontend Next.js application
- `/api` - Backend API server

## Tech Stack
- Frontend: Next.js 13+ with App Router
- UI: shadcn/ui components with Tailwind CSS
- Backend: Node.js with Fastify
- Database: PostgreSQL with Prisma 