import { useQuery } from "@tanstack/react-query"

import { fetchBookings, fetchGetAvailability } from "@/lib/api/booking"
import { bookingKeys } from "@/lib/queryKeys/booking"
import type { Booking, CourtSchedule } from "@/types/booking"

export function useBookingsQuery(tenantId?: string, date?: string) {
  return useQuery<Booking[], Error>({
    queryKey: bookingKeys.list(tenantId, date),
    queryFn: () => fetchBookings(tenantId!, date),
    enabled: Boolean(tenantId && date),
  })
}

export function useAvailabilityQuery(tenantId?: string, date?: string) {
  return useQuery<CourtSchedule, Error>({
    queryKey: bookingKeys.availabilityByTenant(tenantId, date),
    queryFn: () => fetchGetAvailability(tenantId!, date),
    enabled: Boolean(tenantId),
  })
}
