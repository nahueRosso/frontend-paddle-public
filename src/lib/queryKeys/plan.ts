export const planKeys = {
  all: ["plans"] as const,
  catalog: () => [...planKeys.all, "catalog"] as const,
  status: () => [...planKeys.all, "status"] as const,
  statusByTenant: (tenantId?: string) => [...planKeys.status(), tenantId ?? ""] as const,
  subscriptionStatus: () => [...planKeys.all, "subscription-status"] as const,
  subscriptionStatusByTenant: (tenantId?: string) =>
    [...planKeys.subscriptionStatus(), tenantId ?? ""] as const,
}
