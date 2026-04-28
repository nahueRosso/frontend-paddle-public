import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createProfessor,
  deleteProfessor,
  updateProfessor,
} from "@/lib/api/professor"
import { professorKeys } from "@/lib/queryKeys/professor"
import { tenantConfigKeys } from "@/lib/queryKeys/tenant-config"

export function useCreateProfessorMutation(tenantId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProfessor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professorKeys.list(tenantId) })
    },
  })
}

export function useUpdateProfessorMutation(tenantId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ professorId, formData }: { professorId: string; formData: FormData }) =>
      updateProfessor(professorId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professorKeys.list(tenantId) })
    },
  })
}

export function useDeleteProfessorMutation(tenantId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProfessor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professorKeys.list(tenantId) })
    },
  })
}
