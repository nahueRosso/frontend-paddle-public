import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function ProfessorsSkeleton() {

  return (

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

      {Array.from({ length: 3 }).map((_, i) => (

        <Card key={i} className="overflow-hidden rounded-2xl border-[#1E2028] bg-[#101216]">

          <Skeleton className="h-48 w-full" />

          <CardContent className="space-y-2 pt-4">

            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />

          </CardContent>

        </Card>

      ))}

    </div>

  )

}
