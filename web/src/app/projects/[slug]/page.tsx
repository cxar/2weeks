import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ProjectDetails } from "./project-details"

async function getProject(userId: string, slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/learning-path/${slug}`, {
      headers: {
        'Authorization': `Bearer ${userId}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success || !result.project) {
      throw new Error(result.error || 'Invalid response format')
    }

    return result.project
  } catch (error) {
    console.error('getProject error:', error)
    throw error
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { userId, redirectToSignIn } = await auth()
  if (!userId) {
    return redirectToSignIn()
  }

  const { slug } = await params
  const project = await getProject(userId, slug)
  
  return (
    <div className="mx-auto w-full px-4 md:px-8 lg:w-2/3 xl:px-12">
      <ProjectDetails project={project} userId={userId} />
    </div>
  )
}