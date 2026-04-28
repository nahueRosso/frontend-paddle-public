import { useMutation, useQueryClient } from "@tanstack/react-query"

import { CreatePaddleBooking, updateBookingStatus } from "@/lib/api/booking"
import { bookingKeys } from "@/lib/queryKeys/booking"
import type { BookingResponse, BookingStatus, CreateBooking } from "@/types/booking"

export function useCreateBookingMutation() {
  const queryClient = useQueryClient()

  return useMutation<BookingResponse, Error, CreateBooking>({
    mutationFn: CreatePaddleBooking,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: bookingKeys.availabilityByTenant(variables.tenantId, variables.date),
      })
      queryClient.invalidateQueries({
        queryKey: bookingKeys.list(variables.tenantId, variables.date),
      })
    },
  })
}

export function useUpdateBookingStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { bookingId: string; status: BookingStatus; tenantId: string; date: string }
  >({
    mutationFn: ({ bookingId, status }) => updateBookingStatus({ bookingId, status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: bookingKeys.availabilityByTenant(variables.tenantId, variables.date),
      })
      queryClient.invalidateQueries({
        queryKey: bookingKeys.list(variables.tenantId, variables.date),
      })
    },
  })
}
