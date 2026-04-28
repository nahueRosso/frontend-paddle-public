import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ClubLoading() {
  return (
    <div className="space-y-8">
      {/* Title skeleton */}
      <div className="space-y-2 rounded-[2rem] border border-emerald-100 bg-white/75 p-6 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/75 dark:shadow-emerald-950/20">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-[1.5rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
            <CardContent className="flex items-center gap-4 p-5">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info + Map skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-0.5 h-4 w-4" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-[1.75rem] border-emerald-100 bg-white/90 shadow-lg shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-950/80 dark:shadow-emerald-950/20">
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="p-0">
            <Skeleton className="aspect-video w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
