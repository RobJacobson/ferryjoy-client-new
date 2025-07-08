// TerminalVerbose API functions

import { createArrayApi } from "../../shared/apiFactory";
import { toTerminalVerbose } from "./converter";
import type { TerminalVerbose, TerminalVerboseApiResponse } from "./types";

/**
 * URL template for terminal verbose endpoint with strongly-typed parameters
 */
const ROUTES = {
  terminalVerbose: {
    path: "terminalverbose" as const,
    log: "info",
  },
} as const;

/**
 * API function for fetching terminal verbose data from WSF Terminals API
 *
 * Retrieves highly detailed information pertaining to terminals including basic info,
 * bulletins, wait times, sailing space, and transportation information. This endpoint
 * combines data from multiple other terminal endpoints to reduce API calls.
 *
 * @returns Promise resolving to TerminalVerbose array
 */
export const getTerminalVerbose = createArrayApi<
  TerminalVerboseApiResponse[0],
  TerminalVerbose
>("terminals", ROUTES.terminalVerbose, toTerminalVerbose);
