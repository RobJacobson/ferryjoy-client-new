// VesselVerbose React Query hooks

import { type UseQueryOptions, useQuery } from "@tanstack/react-query";

import { useCacheFlushDate } from "../cacheFlushDate/hook";
import { getVesselVerbose } from "./api";
import type { VesselVerbose } from "./types";

const SECOND = 1000;
const HOUR = 60 * 60 * SECOND;
const DAY = 24 * HOUR;

// Hook
export const useVesselVerbose = (
  options?: Partial<UseQueryOptions<VesselVerbose[]>>
) => {
  const { data } = useCacheFlushDate();

  return useQuery({
    queryKey: ["wsf", "vessels", "verbose"],
    queryFn: getVesselVerbose,
    staleTime: DAY,
    gcTime: 2 * HOUR,
    retry: 10,
    retryDelay: (attemptIndex: number) => SECOND * 2 ** (attemptIndex + 2),
    ...(data?.cacheDate && {
      queryKeyHashFn: (queryKey: readonly unknown[]) =>
        JSON.stringify([...queryKey, data.cacheDate.getTime()]),
    }),
    ...options,
  });
};
