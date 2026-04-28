import type { TenantConfig } from "@/types/tenant-config";
import type { TimeSlot } from "@/types/booking";

export type DailyTimeRange = {
  start: string;
  end: string;
};

const DEFAULT_RANGE: DailyTimeRange = {
  start: "09:00",
  end: "21:00",
};

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

export function buildDailyRangesFromConfig(config: TenantConfig): DailyTimeRange[] {
  const ranges: DailyTimeRange[] = [];
  const hasMorning = Boolean(config.openingMorning && config.closingMorning);
  const hasEvening = Boolean(config.openingEvening && config.closingEvening);

  if (config.isDiscontinuous) {
    if (hasMorning) {
      ranges.push({
        start: config.openingMorning!,
        end: config.closingMorning!,
      });
    }
    if (hasEvening) {
      ranges.push({
        start: config.openingEvening!,
        end: config.closingEvening!,
      });
    }
  } else {
    const startCandidate = config.openingMorning ?? config.openingEvening;
    const endCandidate = config.closingEvening ?? config.closingMorning;

    if (startCandidate && endCandidate) {
      ranges.push({ start: startCandidate, end: endCandidate });
    } else if (hasMorning) {
      ranges.push({
        start: config.openingMorning!,
        end: config.closingMorning!,
      });
    } else if (hasEvening) {
      ranges.push({
        start: config.openingEvening!,
        end: config.closingEvening!,
      });
    }
  }

  if (ranges.length === 0) {
    ranges.push(DEFAULT_RANGE);
  }

  return ranges.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
}

export function generateTimeSlots(ranges: DailyTimeRange[], durationMinutes: number): TimeSlot[] {
  const slots: TimeSlot[] = [];

  ranges.forEach(({ start, end }) => {
    const rangeStart = toMinutes(start);
    const rangeEnd = toMinutes(end);

    if (Number.isNaN(rangeStart) || Number.isNaN(rangeEnd) || rangeEnd <= rangeStart) {
      return;
    }

    for (let current = rangeStart; current < rangeEnd; current += durationMinutes) {
      const hours = Math.floor(current / 60)
        .toString()
        .padStart(2, "0");
      const minutes = (current % 60).toString().padStart(2, "0");

      slots.push({
        time: `${hours}:${minutes}`,
        status: "available",
      });
    }
  });

  return slots;
}
