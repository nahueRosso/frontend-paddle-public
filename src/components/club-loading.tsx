import { Skeleton } from "@/components/ui/skeleton"

export function ClubLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-[#1a1d24]" />
        <Skeleton className="h-7 w-48 bg-[#1a1d24]" />
      </div>

      <Skeleton className="h-24 w-full rounded-2xl bg-[#101216]" />

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl bg-[#101216]" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl bg-[#101216]" />
        ))}
      </div>
    </div>
  )
}
