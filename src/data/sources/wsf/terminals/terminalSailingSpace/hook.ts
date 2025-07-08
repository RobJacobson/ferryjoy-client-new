// TerminalSailingSpace React Query hooks

import { useQuery } from "@tanstack/react-query";

import { getTerminalSailingSpace } from "./api";

const SECOND = 1000;

/**
 * Hook function for fetching terminal sailing space data from WSF Terminals API with React Query
 */
export const useTerminalSailingSpace = () =>
  useQuery({
    queryKey: ["wsf", "terminals", "terminal-sailing-space"],
    queryFn: getTerminalSailingSpace,
    staleTime: 15 * SECOND, // 15 seconds
    gcTime: 10 * 60 * SECOND, // 10 minutes
    retry: 5,
    retryDelay: (attemptIndex: number) => SECOND * 2 ** attemptIndex,
  });
