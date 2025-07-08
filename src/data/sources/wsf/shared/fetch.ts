// WSF API fetch utilities

import { Platform } from "react-native";

import log from "@/lib/logger";

import {
  API_BASE,
  API_KEY,
  type LoggingMode,
  TERMINALS_API_BASE,
  type WsfSource,
} from "./config";
import { fetchJsonp } from "./fetchJsonp";
import { fetchNative } from "./fetchNative";

// Main WSF API fetch - handles cross-platform requests with error recovery
/**
 * Fetches data from WSF API with cross-platform compatibility
 *
 * Handles CORS restrictions on web platforms using JSONP and uses native fetch on mobile.
 * Includes automatic error handling and logging. Returns null on failure instead of throwing.
 *
 * @param url - The WSF API URL to fetch from
 * @param loggingMode - Logging mode: "none", "info", or "debug"
 * @param endpoint - Endpoint name for logging purposes
 * @returns Promise resolving to the parsed data or null if fetch fails
 */
const fetchWsfInternal = async <T>(
  url: string,
  loggingMode: LoggingMode = "none",
  endpoint?: string
): Promise<T | null> => {
  try {
    if (loggingMode === "debug" && endpoint) {
      log.debug(`Fetching ${endpoint} at ${url}`);
    }

    // Use JSONP for web (CORS), native fetch for mobile
    const fetcher = Platform.select({
      web: fetchJsonp,
      default: fetchNative,
    });

    const rawData = await fetcher(url);
    // Apply custom reviver to handle WSF API date formats
    const data = JSON.parse(JSON.stringify(rawData)) as T;

    if (loggingMode === "info" || loggingMode === "debug") {
      const itemCount = Array.isArray(data) ? data.length : 1;
      const dataSize =
        Math.round((JSON.stringify(data).length / 1024) * 100) / 100; // Size in kB
      log.info(
        `Fetched ${itemCount} items from ${endpoint || "unknown endpoint"} (${dataSize} kB)`
      );
    }

    return data;
  } catch (error) {
    log.error(
      `Fetch failed for ${endpoint || "unknown endpoint"}: ${url}`,
      error
    );
    // Return null instead of throwing - let callers handle gracefully
    return null;
  }
};

/**
 * Fetches data from WSF API with automatic URL construction
 *
 * @param source - The API source: "vessels" or "terminals"
 * @param endpoint - The API endpoint (e.g., "vessellocations", "cacheflushdate")
 * @param id - Optional numeric ID to append to the endpoint
 * @param loggingMode - Logging mode: "none", "info", or "debug" (default: "none")
 * @returns Promise resolving to the parsed data or null if fetch fails
 */
export const fetchWsf = async <T>(
  source: WsfSource,
  endpoint: string,
  id?: number,
  loggingMode: LoggingMode = "none"
): Promise<T | null> => {
  const baseUrl = source === "vessels" ? API_BASE : TERMINALS_API_BASE;
  const url = `${baseUrl}/${endpoint}${id ? `/${id}` : ""}?apiaccesscode=${API_KEY}`;
  return fetchWsfInternal<T>(url, loggingMode, endpoint);
};

/**
 * Fetches array data from WSF API, returning empty array on failure
 *
 * @param source - The API source: "vessels" or "terminals"
 * @param endpoint - The API endpoint (e.g., "vessellocations", "terminalsailingspace")
 * @param id - Optional numeric ID to append to the endpoint
 * @param loggingMode - Logging mode: "none", "info", or "debug" (default: "none")
 * @returns Promise resolving to the parsed array or empty array if fetch fails
 */
export const fetchWsfArray = async <T>(
  source: WsfSource,
  endpoint: string,
  id?: number,
  loggingMode: LoggingMode = "none"
): Promise<T[]> => {
  return (await fetchWsf<T[]>(source, endpoint, id, loggingMode)) || [];
};
