// JSONP implementation for web CORS workaround

// Constants for request configuration
const JSONP_TIMEOUT_MS = 30_000; // 30 seconds

// JSONP callback types for web CORS workaround
type JSONPCallback = (data: unknown) => void;
type JSONPWindow = Window & Record<string, JSONPCallback | undefined>;

// Generate unique JSONP callback name to avoid conflicts
const generateCallbackName = () =>
  `jsonp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

/**
 * Web JSONP fetch (bypasses CORS restrictions) - returns parsed data directly
 */
export const fetchJsonp = (url: string): Promise<unknown> => {
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
