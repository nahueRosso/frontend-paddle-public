import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createTenantConfig,
  createTenantConfigWithAssets,
  updateTenantConfig,
  updateTenantConfigAssets,
  updateTenantFeaturesPricing,
  type CreateTenantConfigInput,
  type CreateTenantConfigWithAssetsInput,
  type UpdateTenantConfigPayload,
  type UpdateTenantConfigAssetsInput,
  type UpdateTenantFeaturesPricingPayload,
} from "@/lib/api/tenant-config"
import { tenantConfigKeys } from "@/lib/queryKeys/tenant-config"
import type { TenantConfig } from "@/types/tenant-config"

export function useCreateTenantConfigMutation() {
  const queryClient = useQueryClient()

  return useMutation<TenantConfig, Error, CreateTenantConfigInput>({
    mutationFn: createTenantConfig,
    onSuccess: (createdConfig, variables) => {
      queryClient.setQueryData(tenantConfigKeys.detail(variables.tenantId), {
        exists: true,
        data: createdConfig,
      })
      queryClient.invalidateQueries({ queryKey: tenantConfigKeys.detail(variables.tenantId) })
      queryClient.invalidateQueries({ queryKey: tenantConfigKeys.list() })
    },
  })
}

export function useCreateTenantConfigWithAssetsMutation() {
  const queryClient = useQueryClient()

  return useMutation<unknown, Error, CreateTenantConfigWithAssetsInput>({
    mutationFn: createTenantConfigWithAssets,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantConfigKeys.detail(variables.tenantId) })
      queryClient.invalidateQueries({ queryKey: tenantConfigKeys.list() })
    },
  })
}

export function useUpdateTenantConfigMutation() {
  const queryClient = useQueryClient()

  return useMutation<TenantConfig, Error, UpdateTenantConfigPayload>({
    mutationFn: updateTenantConfig,
    onSuccess: (updatedConfig, variables) => {
      queryClient.setQueryData(tenantConfigKeys.detail(variables.tenantId), {
        exists: true,
        data: updatedConfig,
      })
      queryClient.invalidateQueries({ queryKey: tenantConfigKeys.detail(variables.tenantId) })
      queryClient.invalidateQueries({ queryKey: tenantConfigKeys.list() })
    },
  })
}

export function useUpdateTenantConfigAssetsMutation() {
  const queryClient = useQueryClient()

  return useMutation<TenantConfig, Error, UpdateTenantConfigAssetsInput>({
    mutationFn: updateTenantConfigAssets,
    onSuccess: (updatedConfig, variables) => {
      queryClient.setQueryData(tenantConfigKeys.detail(variables.tenantId), {
        exists: true,
        data: updatedConfig,
      })
      queryClient.invalidateQueries({ queryKey: tenantConfigKeys.detail(variables.tenantId) })
      queryClient.invalidateQueries({ queryKey: tenantConfigKeys.list() })
    },
  })
}

export function useUpdateTenantFeaturesPricingMutation() {
  const queryClient = useQueryClient()

  return useMutation<TenantConfig, Error, UpdateTenantFeaturesPricingPayload>({
    mutationFn: updateTenantFeaturesPricing,
    onSuccess: (updatedConfig, variables) => {
      queryClient.setQueryData(tenantConfigKeys.detail(variables.tenantId), {
        exists: true,
        data: updatedConfig,
      })
      queryClient.invalidateQueries({ queryKey: tenantConfigKeys.detail(variables.tenantId) })
      queryClient.invalidateQueries({ queryKey: tenantConfigKeys.list() })
    },
  })
}
