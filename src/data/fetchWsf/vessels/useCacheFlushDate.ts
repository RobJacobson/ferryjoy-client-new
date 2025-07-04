import { useQuery } from "@tanstack/react-query";

import log from "@/lib/logger";

import { API_BASE, API_KEY, fetchWsf } from "../../shared/fetch";

const SECOND = 1000;

// Raw API response type (PascalCase from WSF API)
type CacheFlushDateApiResponse = {
  CacheDate: Date;
};

// Type definition
export type CacheFlushDate = {
  cacheDate: Date;
};

// Mapping function
const mapCacheFlushDate = (
  apiResponse: CacheFlushDateApiResponse
): CacheFlushDate => {
  return {
    cacheDate: apiResponse.CacheDate,
  };
};

// API function
export const getCacheFlushDate = async (): Promise<CacheFlushDate | null> => {
  log.debug("Fetching cache flush date");
  const url = `${API_BASE}/cacheflushdate?apiaccesscode=${API_KEY}`;
  const rawData = await fetchWsf<CacheFlushDateApiResponse>(url);
  if (!rawData) return null;

  return mapCacheFlushDate(rawData);
};

// Hook
export const useCacheFlushDate = () =>
  useQuery({
    queryKey: ["wsf", "vessels", "cache-flush"],
    queryFn: getCacheFlushDate,
    staleTime: 5 * 60 * SECOND, // 5 minutes
    gcTime: 10 * 60 * SECOND, // 10 minutes
    retry: 5,
    retryDelay: (attemptIndex: number) => SECOND * 2 ** attemptIndex,
  });
