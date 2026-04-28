import { useQuery } from "@tanstack/react-query"

import {
  fetchGetConfig,
  fetchGetConfigAll,
  fetchGetConfigBySlug,
  getCourtHoursConfig,
  type TenantConfigQueryResponse,
} from "@/lib/api/tenant-config"
import { tenantConfigKeys } from "@/lib/queryKeys/tenant-config"
import type { ClubesFetch } from "@/types/tenant-config"

export function useTenantConfigQuery(tenantId?: string) {
  return useQuery<TenantConfigQueryResponse, Error>({
    queryKey: tenantConfigKeys.detail(tenantId),
    queryFn: () => fetchGetConfig(tenantId!),
    enabled: Boolean(tenantId),
  })
}

export function useTenantConfigBySlugQuery(slug?: string) {
  return useQuery<TenantConfigQueryResponse, Error>({
    queryKey: tenantConfigKeys.slug(slug),
    queryFn: () => fetchGetConfigBySlug(slug!),
    enabled: Boolean(slug),
  })
}

export function useTenantConfigsQuery() {
  return useQuery<ClubesFetch[], Error>({
    queryKey: tenantConfigKeys.list(),
    queryFn: fetchGetConfigAll,
  })
}

export function useCourtHoursConfigQuery(tenantId?: string) {
  return useQuery({
    queryKey: tenantConfigKeys.courtHours(tenantId),
    queryFn: () => getCourtHoursConfig(tenantId!),
    enabled: Boolean(tenantId),
  })
}
