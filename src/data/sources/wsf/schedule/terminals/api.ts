// Schedule Terminals API functions

import { fetchWsfArray } from "../../shared/fetch";
import type { Terminal } from "../shared/types";
import { toTerminal, toTerminalAndMates, toTerminalMates } from "./converter";
import type {
  WsfTerminalAndMatesResponse,
  WsfTerminalMatesResponse,
  WsfTerminalResponse,
} from "./types";

/**
 * URL templates for terminals endpoints with strongly-typed parameters
 */
const ROUTES = {
  all: {
    path: "/terminals" as const,
    log: "info",
  },
  byRoute: {
    path: "/terminals/{routeID}" as const,
    log: "info",
  },
  andMates: {
    path: "/terminalsandmates/{tripDate}" as const,
    log: "info",
  },
  andMatesByRoute: {
    path: "/terminalsandmatesbyroute/{tripDate}/{routeID}" as const,
    log: "info",
  },
  mates: {
    path: "/terminalmates/{tripDate}/{terminalID}" as const,
    log: "info",
  },
} as const;

/**
 * API function for fetching all terminals from WSF Schedule API
 */
export const getTerminals = (params: { tripDate: Date }): Promise<Terminal[]> =>
  fetchWsfArray<WsfTerminalResponse>("schedule", ROUTES.all, params).then(
    (arr) => arr.map(toTerminal)
  );

/**
 * API function for fetching terminals by route from WSF Schedule API
 */
export const getTerminalsByRoute = (params: {
  routeID: number;
}): Promise<Terminal[]> =>
  fetchWsfArray<WsfTerminalResponse>("schedule", ROUTES.byRoute, params).then(
    (arr) => arr.map(toTerminal)
  );

/**
 * API function for fetching terminals and mates from WSF Schedule API
 */
export const getTerminalsAndMates = (params: { tripDate: Date }) =>
  fetchWsfArray<WsfTerminalAndMatesResponse>(
    "schedule",
    ROUTES.andMates,
    params
  ).then((arr) => arr.map(toTerminalAndMates));

/**
 * API function for fetching terminals and mates by route from WSF Schedule API
 */
export const getTerminalsAndMatesByRoute = (params: {
  tripDate: Date;
  routeID: number;
}) =>
  fetchWsfArray<WsfTerminalAndMatesResponse>(
    "schedule",
    ROUTES.andMatesByRoute,
    params
  ).then((arr) => arr.map(toTerminalAndMates));

/**
 * API function for fetching terminal mates from WSF Schedule API
 */
export const getTerminalMates = (params: {
  tripDate: Date;
  terminalID: number;
}): Promise<Terminal[]> =>
  fetchWsfArray<WsfTerminalMatesResponse>(
    "schedule",
    ROUTES.mates,
    params
  ).then((arr) => arr.map(toTerminalMates));
