export const playerKeys = {
  all: ["players"] as const,
  lists: () => [...playerKeys.all, "lists"] as const,
  list: (tenantId?: string) => [...playerKeys.lists(), tenantId ?? ""] as const,
  tenant: (tenantId?: string) => [...playerKeys.all, "tenant", tenantId ?? ""] as const,
  available: (
    tenantId?: string,
    filters?: {
      categoryLevel?: number
      gender?: string
      allowWomenInMaleCategory?: boolean
      womenCategoryMode?: string
      womenCategoryOffset?: number
      onlyVerified?: boolean
    },
  ) =>
    [
      ...playerKeys.all,
      "available",
      tenantId ?? "",
      filters?.categoryLevel ?? "",
      filters?.gender ?? "",
      String(filters?.allowWomenInMaleCategory ?? ""),
      filters?.womenCategoryMode ?? "",
      filters?.womenCategoryOffset ?? "",
      String(filters?.onlyVerified ?? ""),
    ] as const,
  availableSum: (
    tenantId?: string,
    filters?: {
      sumLimit?: number
      player1Id?: string
      onlyVerified?: boolean
    },
  ) =>
    [
      ...playerKeys.all,
      "available-sum",
      tenantId ?? "",
      filters?.sumLimit ?? "",
      filters?.player1Id ?? "",
      String(filters?.onlyVerified ?? ""),
    ] as const,
  details: () => [...playerKeys.all, "details"] as const,
  detail: (playerId?: string) => [...playerKeys.details(), playerId ?? ""] as const,
}
