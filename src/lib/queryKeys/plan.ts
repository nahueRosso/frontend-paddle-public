export const planKeys = {
  all: ["plans"] as const,
  status: () => [...planKeys.all, "status"] as const,
  statusByTenant: (tenantId?: string) => [...planKeys.status(), tenantId ?? ""] as const,
}
