import { useMutation } from "@tanstack/react-query"

import { createMatchRequest, type CreateMatchRequestPayload } from "@/lib/api/match"

export function useCreateMatchRequestMutation() {
  return useMutation({
    mutationFn: (payload: CreateMatchRequestPayload) => createMatchRequest(payload),
  })
}
