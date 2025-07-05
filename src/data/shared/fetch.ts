import { Platform } from "react-native";

import log from "@/lib/logger";

import { wsfApiReviver } from "../fetchWsf/utils";

// WSF API configuration
export const API_BASE = "https://www.wsdot.wa.gov/ferries/api/vessels/rest";
export const API_KEY = process.env.EXPO_PUBLIC_WSDOT_ACCESS_TOKEN || "";

// Constants for request configuration
const JSONP_TIMEOUT_MS = 30_000; // 30 seconds

// JSONP callback types for web CORS workaround
type JSONPCallback = (data: unknown) => void;
type JSONPWindow = Window & Record<string, JSONPCallback | undefined>;

// Generate unique JSONP callback name to avoid conflicts
const generateCallbackName = () =>
  `jsonp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// Web JSONP fetch (bypasses CORS restrictions) - returns parsed data directly
const fetchJsonp = (url: string): Promise<unknown> => {
  console.log("fetchJsonp", url);
  return new Promise((resolve, reject) => {
    const callbackName = generateCallbackName();
    const script = document.createElement("script");
    const jsonpWindow = window as unknown as JSONPWindow;

    // Cleanup DOM and callback references
    const cleanup = () => {
      if (script.parentNode) document.head.removeChild(script);
      if (jsonpWindow[callbackName]) delete jsonpWindow[callbackName];
    };

    // Cleanup with timeout clearing
    const cleanupWithTimeout = () => {
      clearTimeout(timeoutId);
      cleanup();
    };

    // Prevent hanging requests
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("JSONP request timeout"));
    }, JSONP_TIMEOUT_MS);

    // Success callback - WSF API calls this with data
    jsonpWindow[callbackName] = (data: unknown) => {
      cleanupWithTimeout();
      resolve(data);
    };

    // Handle script loading errors
    script.onerror = () => {
      cleanupWithTimeout();
      reject(new Error("JSONP script load failed"));
    };

    // Build callback URL and inject script
    script.src = `${url}${url.includes("?") ? "&" : "?"}callback=${callbackName}`;
    document.head.appendChild(script);
  });
};

// Native fetch for mobile platforms - returns parsed data directly
const fetchNative = async (url: string): Promise<unknown> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Main WSF API fetch - handles cross-platform requests with error recovery
export const fetchWsf = async <T>(url: string): Promise<T | null> => {
  try {
    log.debug(`Fetching: ${url}`);

    // Use JSONP for web (CORS), native fetch for mobile
    const fetcher = Platform.select({
      web: fetchJsonp,
      default: fetchNative,
    });

    const rawData = await fetcher(url);
    // Apply custom reviver to handle WSF API date formats
    const data = JSON.parse(JSON.stringify(rawData), wsfApiReviver) as T;

    log.debug(`Fetch successful: ${url}`);
    return data;
  } catch (error) {
    log.error(`Fetch failed: ${url}`, error);
    // Return null instead of throwing - let callers handle gracefully
    return null;
  }
};
