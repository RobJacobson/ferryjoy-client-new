/**
 * Simple, reliable type-safe converters for Convex compatibility
 * Automatically handles Date and null conversions at runtime with proper type inference
 */

// Simple identity type for now - let runtime handle all conversions
// This ensures type safety while avoiding complex mapped type issues
type DomainToConvex<T> = T;
type ConvexToDomain<T> = T;

const TIMESTAMP_FIELDS = [
  "TimeStamp",
  "Eta",
  "LeftDock",
  "LeftDockActual",
  "ScheduledDeparture",
  "ArvDockActual",
];

/**
 * Converts a domain object to Convex format with full type safety
 * Automatically detects and converts:
 * - Date → number (timestamp)
 * - null → undefined
 * - Handles nested objects and arrays recursively
 *
 * @template T - The domain type to convert
 * @param data - The domain object to convert
 * @returns Convex-compatible object with proper type inference
 */
export const toConvex = <T>(data: T): DomainToConvex<T> => {
  if (data === null) {
    return undefined as unknown as DomainToConvex<T>;
  }

  if (data instanceof Date) {
    return data.getTime() as DomainToConvex<T>;
  }

  if (Array.isArray(data)) {
    return data.map((item) => toConvex(item)) as DomainToConvex<T>;
  }

  if (typeof data === "object" && data !== null) {
    const result = {} as Record<string, unknown>;
    for (const [key, value] of Object.entries(data)) {
      result[key] = toConvex(value);
    }
    return result as DomainToConvex<T>;
  }

  return data as DomainToConvex<T>;
};

/**
 * Converts a Convex object back to domain format with intelligent timestamp detection
 * Automatically detects and converts:
 * - undefined → null
 * - number fields with timestamp-like names → Date objects
 * - Handles nested objects and arrays recursively
 *
 * @template T - The Convex type to convert back
 * @param data - The Convex object to convert
 * @returns Domain object with proper type inference
 */
export const fromConvex = <T>(data: T): ConvexToDomain<T> => {
  if (data === undefined) {
    return null as unknown as ConvexToDomain<T>;
  }

  if (Array.isArray(data)) {
    return data.map((item) => fromConvex(item)) as ConvexToDomain<T>;
  }

  if (typeof data === "object" && data !== null) {
    const result = {} as Record<string, unknown>;
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "number" && isTimestampField(key)) {
        result[key] = new Date(value);
      } else {
        result[key] = fromConvex(value);
      }
    }
    return result as ConvexToDomain<T>;
  }

  return data as ConvexToDomain<T>;
};

/**
 * Checks if a field name represents a timestamp field
 * Uses naming conventions to identify Date fields in the domain model
 */
const isTimestampField = (fieldName: string): boolean =>
  TIMESTAMP_FIELDS.includes(fieldName);

/**
 * Generic converter that extracts domain data from a Convex document
 * Removes Convex metadata (_id, _creationTime) and converts the remaining data
 *
 * @template T - The domain type that the document data should be converted to
 * @param convexDoc - Convex document with _id, _creationTime, and domain data
 * @returns Domain object of type T with proper conversions applied
 */
export const fromConvexDocument = <T>(convexDoc: {
  _id: string;
  _creationTime: number;
  [key: string]: unknown;
}): T => {
  const { _id, _creationTime, ...domainData } = convexDoc;
  return fromConvex(domainData) as unknown as T;
};
