/** biome-ignore-all lint/suspicious/noExplicitAny: Necessary for Mapbox GL JS compatibility */

/**
 * Filter out undefined values from style objects for Mapbox GL JS compatibility
 * Mapbox GL JS rejects undefined values and throws validation errors
 */
export const filterUndefined = (
  obj: Record<string, any>
): Record<string, any> => {
  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      filtered[key] = value;
    }
  }
  return filtered;
};
