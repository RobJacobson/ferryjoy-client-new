// Schedule Cache Flush Date API functions

import { fetchWsf } from "../../../shared/fetch";
import type { ScheduleCacheFlushDate } from "../../shared/types";
import { toCacheFlushDate, type WsfCacheFlushDateResponse } from "./converter";

/**
 * URL template for cache flush date endpoint with strongly-typed parameters
 */
const ROUTES = {
  cacheFlushDate: {
    path: "/cacheflushdate" as const,
    log: "info",
  },
} as const;

/**
 * API function for fetching schedule cache flush date from WSF API
 */
export const getScheduleCacheFlushDate =
  (): Promise<ScheduleCacheFlushDate | null> =>
    fetchWsf<WsfCacheFlushDateResponse>("schedule", ROUTES.cacheFlushDate).then(
      toCacheFlushDate
    );
