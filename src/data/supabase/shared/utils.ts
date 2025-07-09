// Shared utilities for Supabase hooks

import log from "@/lib/logger";

/**
 * Utility function for logging data size in KB for monitoring
 */
export const logDataSize = (label: string, data: unknown) => {
  const dataSizeKB = (JSON.stringify(data).length * 2) / 1024;
  log.info(`${label} (${dataSizeKB.toFixed(1)} KB)`);
};

/**
 * Utility function for getting start time for data fetching (3 AM today, or yesterday if before 3 AM)
 */
export const getStartTime = (): Date => {
  const now = new Date();
  const today3AM = new Date(now);
  today3AM.setHours(3, 0, 0, 0);
  return now.getHours() < 3
    ? new Date(today3AM.setDate(today3AM.getDate() - 1))
    : today3AM;
};
