// CacheFlushDate data conversion functions

import type { CacheFlushDate, CacheFlushDateApiResponse } from "./types";

// Mapping function
export const mapCacheFlushDate = (
  apiResponse: CacheFlushDateApiResponse
): CacheFlushDate => {
  return {
    cacheDate: apiResponse.CacheDate,
  };
};
