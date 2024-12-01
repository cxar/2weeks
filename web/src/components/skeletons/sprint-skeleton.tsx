import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SprintSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>

        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-40 mb-2" />
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-10 flex-1" />
                ))}
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 