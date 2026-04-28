export const professorKeys = {
  all: ["professors"] as const,
  lists: () => [...professorKeys.all, "lists"] as const,
  list: (tenantId?: string) => [...professorKeys.lists(), tenantId ?? ""] as const,
}
