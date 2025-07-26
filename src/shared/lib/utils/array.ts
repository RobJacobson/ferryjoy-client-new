// Import terminal location data

import routesBoundingBoxes from "@assets/wsdot/routesBoundingBoxes.json";
import terminalLocations from "@assets/wsdot/terminalLocationsFiltered.json";

/**
 * Type-safe function that converts an array to a record using a key extractor
 * @param array - The array of objects to convert
 * @param keyExtractor - Function that extracts the key from each item
 * @returns A record with keys from the extractor and values from the array
 *
 * @example
 * ```typescript
 * const terminals = [
 *   { id: 1, name: 'Seattle' },
 *   { id: 2, name: 'Bainbridge' }
 * ];
 *
 * const terminalMap = toRecord(terminals, item => item.id);
 * // Result: { 1: { id: 1, name: 'Seattle' }, 2: { id: 2, name: 'Bainbridge' } }
 *
 * // Type-safe access
 * const seattle = terminalMap[1]; // Type: { id: number, name: string }
 * ```
 */
export const toRecord = <T, K extends string | number | symbol>(
  array: readonly T[],
  keyExtractor: (item: T) => K
): Record<K, T> =>
  array.reduce(
    (record, item) => {
      const key = keyExtractor(item);
      record[key] = item;
      return record;
    },
    {} as Record<K, T>
  );

/**
 * Map terminal abbreviations to their location objects
 * @param abbreviations - Array of terminal abbreviations (e.g., ['SEA', 'BBI'])
 * @returns Record mapping abbreviations to terminal location objects
 */
export const mapTerminalAbbreviations = (abbreviations: string[]) => {
  const terminalMap = toRecord(
    terminalLocations,
    (terminal: (typeof terminalLocations)[0]) => terminal.TerminalAbbrev
  );
  return abbreviations.reduce(
    (result, abbrev) => {
      const terminal = terminalMap[abbrev as keyof typeof terminalMap];
      if (terminal) result[abbrev] = terminal;
      return result;
    },
    {} as Record<string, (typeof terminalLocations)[0]>
  );
};

/**
 * Get all terminals bounding box
 * @returns Bounding box object with min/max coordinates for all terminals
 */
export const getAllTerminalsBoundingBox = () => {
  return {
    minLatitude: routesBoundingBoxes.allTerminals.boundingBox.minLatitude,
    minLongitude: routesBoundingBoxes.allTerminals.boundingBox.minLongitude,
    maxLatitude: routesBoundingBoxes.allTerminals.boundingBox.maxLatitude,
    maxLongitude: routesBoundingBoxes.allTerminals.boundingBox.maxLongitude,
  };
};
