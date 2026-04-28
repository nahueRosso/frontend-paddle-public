"use client";

import { useEffect, useState } from "react";

/**
 * Returns a Date object that is refreshed at the desired interval.
 * Useful for time-sensitive UI that needs to react when minutes change.
 */
export function useCurrentTime(refreshIntervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), refreshIntervalMs);
    return () => clearInterval(interval);
  }, [refreshIntervalMs]);

  return now;
}
