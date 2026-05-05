import { useMutation } from "@tanstack/react-query"

import { createMatchEntryIntent, type CreateMatchRequestPayload } from "@/lib/api/match"

export function useCreateMatchEntryIntentMutation() {
  return useMutation({
    mutationFn: (payload: CreateMatchRequestPayload) => createMatchEntryIntent(payload),
  })
}
