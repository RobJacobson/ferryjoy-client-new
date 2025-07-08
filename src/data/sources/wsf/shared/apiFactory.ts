// WSF API factory functions for creating standardized API calls

import type { WsfSource } from "./config";
import {
  type EndpointParam,
  fetchWsf,
  fetchWsfArray,
  type ParamsFromPath,
} from "./fetch";

/**
 * Creates an API function that fetches array data and maps it through a converter
 *
 * @param source - The API source: "vessels", "terminals", or "schedule"
 * @param endpoint - The API endpoint (e.g., "vessellocations", "terminalsailingspace") or path config object
 * @param converter - Function to convert API response to domain model
 * @returns Promise resolving to an array of converted objects
 */
export const createArrayApi =
  <T, R, E extends string = string>(
    source: WsfSource,
    endpoint: EndpointParam<E>,
    converter: (data: T) => R
  ) =>
  async (params?: ParamsFromPath<E>): Promise<R[]> =>
    (
      await fetchWsfArray<T, E>(
        source,
        endpoint,
        params || ({} as ParamsFromPath<E>)
      )
    ).map(converter);

/**
 * Creates an API function that fetches single object data and converts it
 *
 * @param source - The API source: "vessels", "terminals", or "schedule"
 * @param endpoint - The API endpoint (e.g., "cacheflushdate") or path config object
 * @param converter - Function to convert API response to domain model
 * @returns Promise resolving to converted object or null if fetch fails
 */
export const createSingleApi =
  <T, R, E extends string = string>(
    source: WsfSource,
    endpoint: EndpointParam<E>,
    converter: (data: T) => R
  ) =>
  async (params?: ParamsFromPath<E>): Promise<R | null> => {
    const rawData = await fetchWsf<T, E>(
      source,
      endpoint,
      params || ({} as ParamsFromPath<E>)
    );
    return rawData ? converter(rawData) : null;
  };
