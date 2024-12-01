"use client"

import { CreateProjectForm } from "@/components/forms/create-project-form"

export default function CreatePage() {
  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Learning Sprint</h1>
        <p className="text-muted-foreground mt-1">
          Start a new 2-week learning sprint. Focus on shipping something every day.
        </p>
      </div>
      <CreateProjectForm userId={process.env.NEXT_PUBLIC_USER_ID!} />
    </div>
  )
}