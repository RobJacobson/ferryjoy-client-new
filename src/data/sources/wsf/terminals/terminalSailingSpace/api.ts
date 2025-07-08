// TerminalSailingSpace API functions

import { createArrayApi } from "../../shared/apiFactory";
import { toTerminalSailingSpace } from "./converter";
import type {
  TerminalSailingSpace,
  TerminalSailingSpaceApiResponse,
} from "./types";

/**
 * API function for fetching terminal sailing space data from WSF Terminals API
 *
 * Retrieves terminal condition data including the number of drive-up and reservation
 * spaces available for select departures. This data changes very frequently.
 *
 * @returns Promise resolving to TerminalSailingSpace array
 */
export const getTerminalSailingSpace = createArrayApi<
  TerminalSailingSpaceApiResponse[0],
  TerminalSailingSpace
>("terminals", "terminalsailingspace", toTerminalSailingSpace);
