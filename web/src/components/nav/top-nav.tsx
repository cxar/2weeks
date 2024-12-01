"use client"

import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Plus } from "lucide-react"

export function TopNav() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  )
} 