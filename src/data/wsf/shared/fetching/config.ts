// WSF API configuration

/**
 * Base URLs for WSF API sources
 */
export const API_BASES = {
  vessels: "https://www.wsdot.wa.gov/ferries/api/vessels/rest",
  terminals: "https://www.wsdot.wa.gov/ferries/api/terminals/rest",
  schedule: "https://www.wsdot.wa.gov/ferries/api/schedule/rest",
} as const;

/**
 * API access token for WSF API authentication
 * Retrieved from environment variable EXPO_PUBLIC_WSDOT_ACCESS_TOKEN
 */
export const API_KEY = process.env.EXPO_PUBLIC_WSDOT_ACCESS_TOKEN || "";

// API source types
export type WsfSource = "vessels" | "terminals" | "schedule";

// Logging modes
export type LoggingMode = "none" | "info" | "debug";
