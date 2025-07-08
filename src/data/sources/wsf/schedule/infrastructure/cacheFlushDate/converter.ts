// Converter function for schedule cache flush date

import { parseWsfDateTime } from "../../shared/dateUtils";
import type { ScheduleCacheFlushDate } from "../../shared/types";

/**
 * Raw API response type for cache flush date
 */
export type WsfCacheFlushDateResponse = {
  CacheFlushDate: string;
  Source: string;
};

/**
 * Converts WSF API cache flush date response to domain model
 * Returns null if no data is provided
 */
export const toCacheFlushDate = (
  data: WsfCacheFlushDateResponse | null
): ScheduleCacheFlushDate | null => {
  if (!data) return null;

  return {
    lastUpdated: parseWsfDateTime(data.CacheFlushDate),
    source: data.Source,
  };
};
