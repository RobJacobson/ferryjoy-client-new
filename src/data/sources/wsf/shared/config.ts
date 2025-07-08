// WSF API configuration

/**
 * Base URL for Washington State Ferries API endpoints
 */
export const API_BASE = "https://www.wsdot.wa.gov/ferries/api/vessels/rest";

/**
 * Base URL for Washington State Ferries Terminals API endpoints
 */
export const TERMINALS_API_BASE =
  "https://www.wsdot.wa.gov/ferries/api/terminals/rest";

/**
 * API access token for WSF API authentication
 * Retrieved from environment variable EXPO_PUBLIC_WSDOT_ACCESS_TOKEN
 */
export const API_KEY = process.env.EXPO_PUBLIC_WSDOT_ACCESS_TOKEN || "";

// API source types
export type WsfSource = "vessels" | "terminals";

// Logging modes
export type LoggingMode = "none" | "info" | "debug";
