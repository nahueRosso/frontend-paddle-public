export const bookingKeys = {
  all: ["bookings"] as const,
  availability: () => [...bookingKeys.all, "availability"] as const,
  availabilityByTenant: (tenantId?: string, date?: string) =>
    [...bookingKeys.availability(), tenantId ?? "", date ?? ""] as const,
  lists: () => [...bookingKeys.all, "lists"] as const,
  list: (tenantId?: string, date?: string) =>
    [...bookingKeys.lists(), tenantId ?? "", date ?? ""] as const,
}
