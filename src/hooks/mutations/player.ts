import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createPlayer, updatePlayer, type UpdatePlayerPayload } from "@/lib/api/player"
import { playerKeys } from "@/lib/queryKeys/player"

export function useCreatePlayerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, payload }: { slug: string; payload: Record<string, unknown> }) =>
      createPlayer(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.all })
    },
  })
}

export function useUpdatePlayerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ playerId, payload }: { playerId: string; payload: UpdatePlayerPayload }) =>
      updatePlayer(playerId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: playerKeys.all })
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(variables.playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() })
    },
  })
}
