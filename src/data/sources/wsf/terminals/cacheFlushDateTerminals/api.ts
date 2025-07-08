// CacheFlushDateTerminals API functions

import { createSingleApi } from "../../shared/apiFactory";
import { toCacheFlushDateTerminals } from "./converter";
import type {
  CacheFlushDateTerminals,
  CacheFlushDateTerminalsApiResponse,
} from "./types";

/**
 * API function for fetching cache flush date from WSF Terminals API
 *
 * Retrieves the date when WSF's internal cache was last flushed for terminals data.
 * This is used to invalidate cached data when WSF updates their terminals data.
 *
 * @returns Promise resolving to CacheFlushDateTerminals object or null if fetch fails
 */
export const getCacheFlushDateTerminals = createSingleApi<
  CacheFlushDateTerminalsApiResponse,
  CacheFlushDateTerminals
>("terminals", "cacheflushdate", toCacheFlushDateTerminals);
