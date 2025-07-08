// CacheFlushDate data conversion functions

import type { CacheFlushDate, CacheFlushDateApiResponse } from "./types";

/**
 * Converter function for transforming API response to CacheFlushDate object from WSF API
 */
export const toCacheFlushDate = (
  apiResponse: CacheFlushDateApiResponse
): CacheFlushDate => ({
  cacheDate: apiResponse.CacheDate,
});
