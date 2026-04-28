import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  cancelPlan,
  changePlan,
  type CancelPlanPayload,
  type ChangePlanPayload,
} from "@/lib/api/plans"
import { planKeys } from "@/lib/queryKeys/plan"

export function useChangePlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ChangePlanPayload) => changePlan(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: planKeys.statusByTenant(variables.tenantId) })
    },
  })
}

export function useCancelPlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CancelPlanPayload) => cancelPlan(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: planKeys.statusByTenant(variables.tenantId) })
    },
  })
}
