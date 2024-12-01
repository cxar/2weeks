import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SprintView } from "@/components/sprint-view"
import { SprintSkeleton } from "@/components/skeletons/sprint-skeleton"

export default async function SprintPage({ params }: { params: { slug: string } }) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <Suspense fallback={<SprintSkeleton />}>
      <SprintView slug={params.slug} />
    </Suspense>
  )
} 