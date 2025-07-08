// WSF API factory functions for creating standardized API calls

import type { WsfSource } from "./config";
import { fetchWsf, fetchWsfArray } from "./fetch";

/**
 * Creates an API function that fetches array data and maps it through a converter
 *
 * @param source - The API source: "vessels" or "terminals"
 * @param endpoint - The API endpoint (e.g., "vessellocations", "terminalsailingspace")
 * @param converter - Function to convert API response to domain model
 * @returns Promise resolving to an array of converted objects
 */
export const createArrayApi =
  <T, R>(source: WsfSource, endpoint: string, converter: (data: T) => R) =>
  async (): Promise<R[]> =>
    (await fetchWsfArray<T>(source, endpoint)).map(converter);

/**
 * Creates an API function that fetches single object data and converts it
 *
 * @param source - The API source: "vessels" or "terminals"
 * @param endpoint - The API endpoint (e.g., "cacheflushdate")
 * @param converter - Function to convert API response to domain model
 * @returns Promise resolving to converted object or null if fetch fails
 */
export const createSingleApi =
  <T, R>(source: WsfSource, endpoint: string, converter: (data: T) => R) =>
  async (): Promise<R | null> => {
    const rawData = await fetchWsf<T>(source, endpoint);
    return rawData ? converter(rawData) : null;
  };
