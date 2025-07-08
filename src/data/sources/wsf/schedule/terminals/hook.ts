// Schedule Terminals hooks

import { useQuery } from "@tanstack/react-query";

import type { Terminal } from "../shared/types";
import {
  getTerminalMates,
  getTerminals,
  getTerminalsAndMates,
  getTerminalsAndMatesByRoute,
  getTerminalsByRoute,
} from "./api";

/**
 * Hook for fetching all terminals from WSF Schedule API
 */
export const useTerminals = (tripDate: Date) => {
  return useQuery({
    queryKey: ["schedule", "terminals", tripDate.toISOString().split("T")[0]],
    queryFn: () => getTerminals({ tripDate }),
    enabled: !!tripDate,
  });
};

/**
 * Hook for fetching terminals by route from WSF Schedule API
 */
export const useTerminalsByRoute = (routeId: number) => {
  return useQuery({
    queryKey: ["schedule", "terminals", "byRoute", routeId],
    queryFn: () => getTerminalsByRoute({ routeID: routeId }),
    enabled: !!routeId,
  });
};

/**
 * Hook for fetching terminals and mates from WSF Schedule API
 */
export const useTerminalsAndMates = (tripDate: Date) => {
  return useQuery({
    queryKey: [
      "schedule",
      "terminals",
      "andMates",
      tripDate.toISOString().split("T")[0],
    ],
    queryFn: () => getTerminalsAndMates({ tripDate }),
    enabled: !!tripDate,
  });
};

/**
 * Hook for fetching terminals and mates by route from WSF Schedule API
 */
export const useTerminalsAndMatesByRoute = (
  tripDate: Date,
  routeId: number
) => {
  return useQuery({
    queryKey: [
      "schedule",
      "terminals",
      "andMatesByRoute",
      tripDate.toISOString().split("T")[0],
      routeId,
    ],
    queryFn: () => getTerminalsAndMatesByRoute({ tripDate, routeID: routeId }),
    enabled: !!tripDate && !!routeId,
  });
};

/**
 * Hook for fetching terminal mates from WSF Schedule API
 */
export const useTerminalMates = (tripDate: Date, terminalId: number) => {
  return useQuery({
    queryKey: [
      "schedule",
      "terminals",
      "mates",
      tripDate.toISOString().split("T")[0],
      terminalId,
    ],
    queryFn: () => getTerminalMates({ tripDate, terminalID: terminalId }),
    enabled: !!tripDate && !!terminalId,
  });
};
