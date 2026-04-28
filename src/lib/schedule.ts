import type { TimeSlot } from "@/types/booking";

function normalizeTime(time: string) {
  return time.length === 5 ? `${time}:00` : time;
}

export function getSlotStart(date: string, time: string) {
  return new Date(`${date}T${normalizeTime(time)}`);
}

export function getSlotEnd(date: string, time: string, durationMinutes: number) {
  const start = getSlotStart(date, time);
  return new Date(start.getTime() + durationMinutes * 60_000);
}

export function isSlotPast(
  date: string,
  time: string,
  now: Date = new Date(),
) {
  return getSlotStart(date, time).getTime() < now.getTime();
}

export function isSlotCurrent(
  date: string,
  time: string,
  durationMinutes: number,
  now: Date = new Date(),
) {
  const start = getSlotStart(date, time);
  const end = getSlotEnd(date, time, durationMinutes);
  return now >= start && now < end;
}

export type SlotWithMeta = TimeSlot & {
  courtId: number;
  start: Date;
  end: Date;
};

export function buildSlotTimeline(
  courts: { courtId: number; slots: TimeSlot[] }[],
  bookingDate: string,
  durationMinutes: number,
): SlotWithMeta[] {
  return courts
    .flatMap((court) =>
      court.slots.map((slot) => {
        const start = getSlotStart(bookingDate, slot.time);
        const end = getSlotEnd(bookingDate, slot.time, durationMinutes);

        return {
          ...slot,
          courtId: court.courtId,
          start,
          end,
        };
      }),
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}
