// Schedule Valid Date Range hooks

import { useQuery } from "@tanstack/react-query";

import { getValidDateRange } from "./api";
import type { ValidDateRange } from "./types";

/**
 * Hook for fetching valid date range from WSF Schedule API
 *
 * Retrieves the valid date range for all schedule operations.
 * This is used to determine which dates are supported by the API.
 *
 * @returns React Query result with ValidDateRange object
 */
export const useValidDateRange = () => {
  return useQuery({
    queryKey: ["schedule", "validDateRange"],
    queryFn: getValidDateRange,
  });
};
