// CacheFlushDate API functions

import { createSingleApi } from "../../shared/apiFactory";
import { toCacheFlushDate } from "./converter";
import type { CacheFlushDate, CacheFlushDateApiResponse } from "./types";

/**
 * URL template for cache flush date endpoint with strongly-typed parameters
 */
const ROUTES = {
  cacheFlushDate: {
    path: "cacheflushdate" as const,
    log: "info",
  },
} as const;

/**
 * API function for fetching cache flush date from WSF API
 *
 * Retrieves the date when WSF's internal cache was last flushed.
 * This is used to invalidate cached data when WSF updates their data.
 *
 * @returns Promise resolving to CacheFlushDate object or null if fetch fails
 */
export const getCacheFlushDate = createSingleApi<
  CacheFlushDateApiResponse,
  CacheFlushDate
>("vessels", ROUTES.cacheFlushDate, toCacheFlushDate);
