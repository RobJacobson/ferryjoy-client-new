// Schedule Valid Date Range API functions

import { fetchWsf } from "../../../shared/fetch";
import { toValidDateRange, type WsfValidDateRangeResponse } from "./converter";
import type { ValidDateRange } from "./types";

/**
 * URL template for valid date range endpoint with strongly-typed parameters
 */
const ROUTES = {
  validDateRange: {
    path: "/validdaterange" as const,
    log: "info",
  },
} as const;

/**
 * API function for fetching valid date range from WSF API
 */
export const getValidDateRange = (): Promise<ValidDateRange | null> =>
  fetchWsf<WsfValidDateRangeResponse>("schedule", ROUTES.validDateRange).then(
    toValidDateRange
  );
