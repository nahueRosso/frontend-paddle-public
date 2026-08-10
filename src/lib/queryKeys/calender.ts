export const calenderKeys = {
  all: ["calender"] as const,
  myBooking: () => [...calenderKeys.all, "my-booking"] as const,
  myBookingByEmail: (email?: string) => [...calenderKeys.myBooking(), email ?? ""] as const,
}
