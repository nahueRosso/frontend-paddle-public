export const tournamentKeys = {
  all: ["tournaments"] as const,
  lists: () => [...tournamentKeys.all, "lists"] as const,
  list: (tenantId?: string) => [...tournamentKeys.lists(), tenantId ?? ""] as const,
  fixtures: () => [...tournamentKeys.all, "fixtures"] as const,
  fixture: (tenantId?: string) => [...tournamentKeys.fixtures(), tenantId ?? ""] as const,
  registrationOptions: (
    tenantId?: string,
    tournamentId?: string,
    playerId?: string,
    categoryId?: string,
  ) =>
    [
      ...tournamentKeys.all,
      "registration-options",
      tenantId ?? "",
      tournamentId ?? "",
      playerId ?? "",
      categoryId ?? "",
    ] as const,
  eligiblePartners: (
    tenantId?: string,
    tournamentId?: string,
    playerId?: string,
    categoryId?: string,
  ) =>
    [
      ...tournamentKeys.all,
      "eligible-partners",
      tenantId ?? "",
      tournamentId ?? "",
      playerId ?? "",
      categoryId ?? "",
    ] as const,
  availablePlayers: (
    tenantId?: string,
    tournamentId?: string,
    categoryId?: string,
  ) =>
    [
      ...tournamentKeys.all,
      "available-players",
      tenantId ?? "",
      tournamentId ?? "",
      categoryId ?? "",
    ] as const,
  partnerRequests: (tenantId?: string, playerId?: string) =>
    [
      ...tournamentKeys.all,
      "partner-requests",
      tenantId ?? "",
      playerId ?? "",
    ] as const,
}
