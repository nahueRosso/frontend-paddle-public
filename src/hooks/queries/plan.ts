import { useQuery } from "@tanstack/react-query"

import {
  getPaymentsPlans,
  getPlanStatus,
  type PaymentsPlan,
  type PlanStatus,
} from "@/lib/api/plans"
import { getSubscriptionStatus } from "@/lib/api/subscription"
import type { SubscriptionStatus } from "@/types/subscription"
import { planKeys } from "@/lib/queryKeys/plan"

export function usePlanStatusQuery(tenantId?: string, publicSessionReady = true) {
  return useQuery<PlanStatus, Error>({
    queryKey: planKeys.statusByTenant(tenantId),
    queryFn: () => getPlanStatus(tenantId!),
    enabled: Boolean(tenantId) && publicSessionReady,
  })
}

export function usePaymentsPlansQuery() {
  return useQuery<PaymentsPlan[], Error>({
    queryKey: planKeys.catalog(),
    queryFn: getPaymentsPlans,
  })
}

export function useSubscriptionStatusQuery(tenantId?: string, enabled = true) {
  return useQuery<SubscriptionStatus, Error>({
    queryKey: planKeys.subscriptionStatusByTenant(tenantId),
    queryFn: () => getSubscriptionStatus(tenantId!),
    enabled: Boolean(tenantId) && enabled,
  })
}
