import { useQuery } from "@tanstack/react-query"

import {
  getPaymentsPlans,
  getPlanStatus,
  type PaymentsPlan,
  type PlanStatus,
} from "@/lib/api/plans"
import { planKeys } from "@/lib/queryKeys/plan" 

export function usePlanStatusQuery(tenantId?: string) {
  return useQuery<PlanStatus, Error>({
    queryKey: planKeys.statusByTenant(tenantId),
    queryFn: () => getPlanStatus(tenantId!),
    enabled: Boolean(tenantId),
  })
}

export function usePaymentsPlansQuery() {
  return useQuery<PaymentsPlan[], Error>({
    queryKey: planKeys.catalog(),
    queryFn: getPaymentsPlans,
  })
}
