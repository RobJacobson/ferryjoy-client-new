// WSF API fetch utilities

import log from "@/lib/logger";

import { dateToWsfPathFormat } from "../schedule/shared/dateUtils";
import { API_BASES, API_KEY, type LoggingMode, type WsfSource } from "./config";
import { fetchInternal } from "./fetchInternal";

/**
 * Extracts parameter names from a path template string
 * Example: "/routes/{TripDate}/{DepartingTerminalID}" -> ["TripDate", "DepartingTerminalID"]
 */
type ExtractParams<T extends string> =
  T extends `${string}{${infer Param}}${infer Rest}`
    ? Param | ExtractParams<Rest>
    : never;

/**
 * Converts parameter names to a parameter object type
 * Example: ["TripDate", "DepartingTerminalID"] -> { TripDate: Date | string | number; DepartingTerminalID: Date | string | number; }
 */
export type ParamsFromPath<T extends string> = {
  [K in ExtractParams<T>]: Date | string | number;
};

/**
 * Type for path configuration with optional logging and parameter types
 */
export type PathConfig<T extends string = string> = {
  path: T;
  log?: LoggingMode;
  params?: ParamsFromPath<T>;
};

/**
 * Type for endpoint parameter - can be string or path config
 */
export type EndpointParam<T extends string = string> = string | PathConfig<T>;

/**
 * Validates and substitutes parameters in a URL template
 *
 * @param template - URL template with placeholders like "/routes/{tripDate}"
 * @param params - Parameters to substitute (supports string, number, and Date values)
 * @returns The substituted URL
 */
const substituteTemplate = (
  template: string,
  params: Record<string, string | number | Date> = {}
): string => {
  let url = template;

  // Substitute provided parameters
  for (const [key, value] of Object.entries(params)) {
    const placeholder = `{${key}}`;
    if (url.includes(placeholder)) {
      // Convert Date objects to WSF path format, otherwise convert to string
      const stringValue =
        value instanceof Date ? dateToWsfPathFormat(value) : String(value);
      url = url.replace(placeholder, stringValue);
    }
  }

  return url;
};

/**
 * Builds a complete WSF API URL with base URL, endpoint, and parameters
 *
 * @param source - The API source: "vessels", "terminals", or "schedule"
 * @param endpoint - The API endpoint template with placeholders
 * @param params - Parameters to substitute in the URL template
 * @returns Promise resolving to the complete URL
 */
const buildWsfUrl = async (
  source: WsfSource,
  endpoint: string,
  params: Record<string, string | number | Date> = {}
): Promise<string> => {
  const baseUrl = API_BASES[source];
  const substitutedEndpoint = substituteTemplate(endpoint, params);
  return `${baseUrl}${substitutedEndpoint}`;
};

/**
 * Fetches data from WSF API with automatic URL parameter substitution
 *
 * @param source - The API source: "vessels", "terminals", or "schedule"
 * @param endpoint - The API endpoint template with placeholders (e.g., "/vessellocations/{VesselID}") or path config object
 * @param params - Parameters to substitute in the URL template (strongly typed based on endpoint)
 * @returns Promise resolving to the API response or null if fetch fails
 */
export const fetchWsf = async <T, E extends string = string>(
  source: WsfSource,
  endpoint: EndpointParam<E>,
  params: ParamsFromPath<E> = {} as ParamsFromPath<E>
): Promise<T | null> => {
  const pathConfig =
    typeof endpoint === "string" ? { path: endpoint } : endpoint;
  const url = await buildWsfUrl(source, pathConfig.path, params);
  return await fetchInternal<T>(
    url,
    pathConfig.path,
    (pathConfig as PathConfig<E>).log
  );
};

/**
 * Fetches array data from WSF API with automatic URL parameter substitution
 *
 * @param source - The API source: "vessels", "terminals", or "schedule"
 * @param endpoint - The API endpoint template with placeholders (e.g., "/vessellocations/{VesselID}") or path config object
 * @param params - Parameters to substitute in the URL template (strongly typed based on endpoint)
 * @returns Promise resolving to an array of API responses or empty array if fetch fails
 */
export const fetchWsfArray = async <T, E extends string = string>(
  source: WsfSource,
  endpoint: EndpointParam<E>,
  params: ParamsFromPath<E> = {} as ParamsFromPath<E>
): Promise<T[]> => {
  return (await fetchWsf<T[], E>(source, endpoint, params)) || [];
};
