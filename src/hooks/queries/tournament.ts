import { useQuery } from "@tanstack/react-query"

import {
  fetchTournament,
  fetchTournamentsByStatus,
} from "@/lib/api/tournament"
import { tournamentKeys } from "@/lib/queryKeys/tournament"
import type { Tournament } from "@/types/tournament"
import type { TournamentGroup } from "@/types/tournament-group"

export function useTournamentsByStatusQuery(
  tenantId?: string,
  status: "ongoing" | "finished" | "upcoming" | "post_deadline" = "ongoing",
  enabled = true,
) {
  return useQuery<Tournament[]>({
    queryKey: [...tournamentKeys.list(tenantId), status],
    queryFn: () => fetchTournament(tenantId!, status),
    enabled: Boolean(tenantId) && enabled,
  })
}

export function useTournamentFixtureQuery(tenantId?: string) {
  return useQuery<TournamentGroup[]>({
    queryKey: tournamentKeys.fixture(tenantId),
    queryFn: () => fetchTournamentsByStatus(tenantId!) as Promise<TournamentGroup[]>,
    enabled: Boolean(tenantId),
  })
}
