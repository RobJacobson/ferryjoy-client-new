// CacheFlushDate React Query hooks

import { useQuery } from "@tanstack/react-query";

import { getCacheFlushDate } from "./api";

const SECOND = 1000;

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
