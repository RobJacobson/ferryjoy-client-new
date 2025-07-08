// CacheFlushDate API functions

import log from "@/lib/logger";

import { API_BASE, API_KEY, fetchWsf } from "../shared/fetch";
import { mapCacheFlushDate } from "./converter";
import type { CacheFlushDateApiResponse } from "./types";

// API function
export const getCacheFlushDate = async () => {
  log.debug("Fetching cache flush date");
  const url = `${API_BASE}/cacheflushdate?apiaccesscode=${API_KEY}`;
  const rawData = await fetchWsf<CacheFlushDateApiResponse>(url);
  if (!rawData) return null;

  return mapCacheFlushDate(rawData);
};
