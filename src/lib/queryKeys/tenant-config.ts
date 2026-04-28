export const tenantConfigKeys = {
  all: ["tenant-config"] as const,
  lists: () => [...tenantConfigKeys.all, "lists"] as const,
  list: () => [...tenantConfigKeys.lists(), "all"] as const,
  details: () => [...tenantConfigKeys.all, "details"] as const,
  detail: (tenantId?: string) => [...tenantConfigKeys.details(), tenantId ?? ""] as const,
  slugs: () => [...tenantConfigKeys.all, "slugs"] as const,
  slug: (slug?: string) => [...tenantConfigKeys.slugs(), slug ?? ""] as const,
  courtHours: (tenantId?: string) => [...tenantConfigKeys.all, "court-hours", tenantId ?? ""] as const,
}
