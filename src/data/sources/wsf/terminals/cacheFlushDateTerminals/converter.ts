// CacheFlushDateTerminals data conversion functions

import type {
  CacheFlushDateTerminals,
  CacheFlushDateTerminalsApiResponse,
} from "./types";

/**
 * Converter function for transforming API response to CacheFlushDateTerminals object from WSF Terminals API
 */
export const toCacheFlushDateTerminals = (
  apiResponse: CacheFlushDateTerminalsApiResponse
): CacheFlushDateTerminals => ({
  cacheDate: apiResponse.CacheDate,
});
