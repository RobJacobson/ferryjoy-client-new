// CacheFlushDateTerminals React Query hooks

import { useQuery } from "@tanstack/react-query";

import { getCacheFlushDateTerminals } from "./api";

const SECOND = 1000;

/**
 * Hook function for fetching cache flush date from WSF Terminals API with React Query
 */
export const useCacheFlushDateTerminals = () =>
  useQuery({
    queryKey: ["wsf", "terminals", "cache-flush"],
    queryFn: getCacheFlushDateTerminals,
    staleTime: 5 * 60 * SECOND, // 5 minutes
    gcTime: 10 * 60 * SECOND, // 10 minutes
    retry: 5,
    retryDelay: (attemptIndex: number) => SECOND * 2 ** attemptIndex,
  });
