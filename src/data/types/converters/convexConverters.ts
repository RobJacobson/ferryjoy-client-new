/**
 * Generic converters for Convex compatibility
 * Handles Date ↔ number conversion using JSON serialization
 */

/**
 * Utility type to convert Date fields to number in a type
 * Handles nested objects and arrays
 */
type DateToNumber<T> = {
  [K in keyof T]: T[K] extends Date
    ? number
    : T[K] extends (infer U)[]
      ? DateToNumber<U>[]
      : T[K] extends Record<string, unknown>
        ? DateToNumber<T[K]>
        : T[K];
};

/**
 * Utility type to convert number timestamp fields to Date in a type
 * Handles nested objects and arrays
 */
type NumberToDate<T> = {
  [K in keyof T]: T[K] extends number
    ? Date
    : T[K] extends (infer U)[]
      ? NumberToDate<U>[]
      : T[K] extends Record<string, unknown>
        ? NumberToDate<T[K]>
        : T[K];
};

/**
 * Converts a domain object to Convex format
 * Converts all Date fields to numbers for Convex compatibility
 *
 * @template T - The input type with Date fields
 * @param data - The input object with Date fields
 * @returns A new object with Date fields converted to numbers
 */
export const toConvex = <T extends Record<string, unknown>>(
  data: T
): DateToNumber<T> => {
  const result = { ...data } as DateToNumber<T>;
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      (result as Record<string, unknown>)[key] = value.getTime();
    }
  }
  return result;
};

/**
 * Converts a Convex object back to domain format
 * Converts number timestamps back to Date objects
 *
 * @template T - The input type with number timestamp fields
 * @param data - The input object with number timestamp fields
 * @returns A new object with number timestamp fields converted to Date objects
 */
export const fromConvex = <T extends Record<string, unknown>>(
  data: T
): NumberToDate<T> => {
  const result = { ...data } as NumberToDate<T>;
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "number" && isTimestamp(value)) {
      (result as Record<string, unknown>)[key] = new Date(value);
    }
  }
  return result;
};

/**
 * Checks if a number is likely a timestamp
 * Looks for numbers in the range of Unix timestamps (milliseconds since epoch)
 *
 * @param value - The number to check
 * @returns true if the number is in a reasonable timestamp range
 */
const isTimestamp = (value: number): boolean => {
  // Unix timestamp range: 2000-01-01 to 2100-01-01
  // This covers most realistic use cases while avoiding false positives
  const MIN_TIMESTAMP = 946684800000; // 2000-01-01 00:00:00 UTC
  const MAX_TIMESTAMP = 4102444800000; // 2100-01-01 00:00:00 UTC

  return value >= MIN_TIMESTAMP && value <= MAX_TIMESTAMP;
};

/**
 * Creates a type-safe converter pair for a specific type
 */
export const createConvexConverter = <T extends Record<string, unknown>>() =>
  ({
    toConvex: toConvex as <U extends Record<string, unknown>>(
      data: U
    ) => DateToNumber<U>,
    fromConvex: fromConvex as <U extends Record<string, unknown>>(
      data: U
    ) => NumberToDate<U>,
  }) as const;
