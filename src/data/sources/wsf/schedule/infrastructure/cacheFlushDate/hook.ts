// Schedule Cache Flush Date hooks

import { useQuery } from "@tanstack/react-query";

import { getScheduleCacheFlushDate } from "./api";

/**
 * Hook for fetching schedule cache flush date from WSF API
 *
 * Retrieves the timestamp when the schedule data was last updated.
 * This is used to determine if cached schedule data is still valid.
 *
 * @returns React Query result with ScheduleCacheFlushDate object
 */
export const useScheduleCacheFlushDate = () => {
  return useQuery({
    queryKey: ["schedule", "cacheFlushDate"],
    queryFn: getScheduleCacheFlushDate,
  });
};
