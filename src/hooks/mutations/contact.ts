import { useMutation } from "@tanstack/react-query"

import { submitContactForm, type ContactPayload } from "@/lib/api/contact"

export function useSubmitContactMutation() {
  return useMutation({
    mutationFn: (payload: ContactPayload) => submitContactForm(payload),
  })
}
