import { useQuery } from "@tanstack/react-query"

import { getProfessors } from "@/lib/api/professor"
import { professorKeys } from "@/lib/queryKeys/professor"
import type { Professor } from "@/types/professor"

export function useProfessorsQuery(tenantId?: string) {
  return useQuery<Professor[], Error>({
    queryKey: professorKeys.list(tenantId),
    queryFn: () => getProfessors(tenantId!),
    enabled: Boolean(tenantId),
  })
}
