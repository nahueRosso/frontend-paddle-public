import { useQuery } from "@tanstack/react-query"

import { getMyCalenderBooking, type MyBookingResponse } from "@/lib/api/calender"
import { calenderKeys } from "@/lib/queryKeys/calender"

export function useMyCalenderBookingQuery(email?: string, enabled = true) {
  return useQuery<MyBookingResponse, Error>({
    queryKey: calenderKeys.myBookingByEmail(email),
    queryFn: () => getMyCalenderBooking(email!),
    enabled: Boolean(email) && enabled,
  })
}
