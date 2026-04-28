import { useQuery } from "@tanstack/react-query"

import { getPlanStatus, type PlanStatus } from "@/lib/api/plans"
import { planKeys } from "@/lib/queryKeys/plan"

export function usePlanStatusQuery(tenantId?: string) {
  return useQuery<PlanStatus, Error>({
    queryKey: planKeys.statusByTenant(tenantId),
    queryFn: () => getPlanStatus(tenantId!),
    enabled: Boolean(tenantId),
  })
}
