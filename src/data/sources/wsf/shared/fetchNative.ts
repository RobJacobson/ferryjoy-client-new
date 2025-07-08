// Native fetch for mobile platforms - returns parsed data directly

/**
 * Performs a native fetch and returns parsed JSON data.
 * Throws on HTTP error.
 */
export const fetchNative = async (url: string): Promise<unknown> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};
