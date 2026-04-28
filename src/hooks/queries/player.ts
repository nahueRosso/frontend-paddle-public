import { useQuery } from "@tanstack/react-query"

import {
  fetchAvailablePlayers,
  fetchAvailableSumPlayers,
  fetchPlayersByTenant,
  type GetAvailablePlayersParams,
  type AvailablePlayer,
  type AvailableSumPlayer,
  type GetAvailableSumPlayersParams,
  type TenantPlayer,
} from "@/lib/api/player"
import { playerKeys } from "@/lib/queryKeys/player"

export function useAvailablePlayersQuery(
  tenantId?: string,
  params?: GetAvailablePlayersParams,
  enabled = true,
) {
  return useQuery<AvailablePlayer[]>({
    queryKey: playerKeys.available(tenantId, params),
    queryFn: () => fetchAvailablePlayers(tenantId!, params!),
    enabled: Boolean(tenantId && params && enabled),
  })
}

export function usePlayersByTenantQuery(tenantId?: string) {
  return useQuery<TenantPlayer[]>({
    queryKey: playerKeys.tenant(tenantId),
    queryFn: () => fetchPlayersByTenant(tenantId!),
    enabled: Boolean(tenantId),
  })
}

export function useAvailableSumPlayersQuery(
  tenantId?: string,
  params?: GetAvailableSumPlayersParams,
  enabled = true,
) {
  return useQuery<AvailableSumPlayer[]>({
    queryKey: playerKeys.availableSum(tenantId, params),
    queryFn: () => fetchAvailableSumPlayers(tenantId!, params!),
    enabled: Boolean(tenantId && params && enabled),
  })
}
