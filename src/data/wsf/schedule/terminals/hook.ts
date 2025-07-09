// Schedule terminals hooks

import { useQuery } from "@tanstack/react-query";

import type { TerminalBasics as ScheduleTerminal } from "../../terminals/types";
import {
  getTerminalMates,
  getTerminals,
  getTerminalsAndMates,
  getTerminalsByRoute,
} from "./api";

/**
 * Hook for fetching all terminals from WSF Schedule API
 *
 * @param tripDate - The date for which to get terminal information
 * @returns React Query result with ScheduleTerminal array data
 */
export const useTerminals = (tripDate: Date) => {
  return useQuery({
    queryKey: ["schedule", "terminals", tripDate.toISOString().split("T")[0]],
    queryFn: () => getTerminals(tripDate),
  });
};

/**
 * Hook for fetching terminals by route from WSF Schedule API
 *
 * @param routeId - The route ID to get terminals for
 * @returns React Query result with ScheduleTerminal array data
 */
export const useTerminalsByRoute = (routeId: number) => {
  return useQuery({
    queryKey: ["schedule", "terminals", "byRoute", routeId],
    queryFn: () => getTerminalsByRoute(routeId),
  });
};

/**
 * Hook for fetching terminals and mates from WSF Schedule API
 *
 * @param tripDate - The date for which to get terminal combinations
 * @returns React Query result with ScheduleTerminal array data
 */
export const useTerminalsAndMates = (tripDate: Date) => {
  return useQuery({
    queryKey: [
      "schedule",
      "terminals",
      "andMates",
      tripDate.toISOString().split("T")[0],
    ],
    queryFn: () => getTerminalsAndMates(tripDate),
  });
};

/**
 * Hook for fetching terminal mates from WSF Schedule API
 *
 * @param tripDate - The date for which to get terminal mates
 * @param terminalId - The departing terminal ID
 * @returns React Query result with ScheduleTerminal array data
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
    queryFn: () => getTerminalMates(tripDate, terminalId),
  });
};
