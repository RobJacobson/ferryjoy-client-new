// Internal fetch function for WSF API

import { Platform } from "react-native";

import log from "@/lib/logger";

import type { LoggingMode } from "./config";
import { fetchJsonp } from "./fetchJsonp";
import { fetchNative } from "./fetchNative";

/**
 * Fetches data from WSF API with cross-platform compatibility
 *
 * Handles CORS restrictions on web platforms using JSONP and uses native fetch on mobile.
 * Includes automatic error handling and logging. Returns null on failure instead of throwing.
 *
 * @param url - The WSF API URL to fetch from
 * @param endpoint - Endpoint name for logging purposes
 * @param loggingMode - Logging mode (defaults to "info")
 * @returns Promise resolving to the parsed data or null if fetch fails
 */
export const fetchInternal = async <T>(
  url: string,
  endpoint?: string,
  loggingMode: LoggingMode = "info"
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
