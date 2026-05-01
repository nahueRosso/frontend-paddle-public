import type { Booking, TimeSlot } from '@/types/booking'

export function generateTimeSlots(
  openingTime: string,
  closingTime: string,
  durationMinutes: number,
  courtNumber: number,
  bookings: Booking[]
): TimeSlot[] {
  const slots: TimeSlot[] = []

  const [openH, openM] = openingTime.split(":").map(Number)
  const [closeH, closeM] = closingTime.split(":").map(Number)

  const openingMinutes = openH * 60 + openM
  const closingMinutes = closeH * 60 + closeM

  let currentMinutes = openingMinutes

  while (currentMinutes + durationMinutes <= closingMinutes) {
    const startTime = formatTime(currentMinutes)
    const endTime = formatTime(currentMinutes + durationMinutes)

    const matchingBooking = bookings.find(
      (b) =>
        b.courtNumber === courtNumber &&
        b.startTime === startTime &&
        b.status !== "cancelled"
    )

    if (matchingBooking) {
      slots.push({
        time: startTime,
        startTime,
        endTime,
        status: matchingBooking.status === "pending" ? "pending" : "occupied",
        bookingId: matchingBooking.id,
      })
    } else {
      slots.push({
        time: startTime,
        startTime,
        endTime,
        status: "available",
      })
    }

    currentMinutes += durationMinutes
  }

  return slots
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}
