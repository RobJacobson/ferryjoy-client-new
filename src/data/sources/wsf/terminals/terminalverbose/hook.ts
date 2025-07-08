// TerminalVerbose React Query hooks

import { useQuery } from "@tanstack/react-query";

import { getTerminalVerbose } from "./api";

const SECOND = 1000;

/**
 * Hook function for fetching terminal verbose data from WSF Terminals API with React Query
 */
export const useTerminalVerbose = () =>
  useQuery({
    queryKey: ["wsf", "terminals", "terminal-verbose"],
    queryFn: getTerminalVerbose,
    staleTime: 5 * 60 * SECOND, // 5 minutes
    gcTime: 10 * 60 * SECOND, // 10 minutes
    retry: 5,
    retryDelay: (attemptIndex: number) => SECOND * 2 ** attemptIndex,
  });
