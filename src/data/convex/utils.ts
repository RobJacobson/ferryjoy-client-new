import type { VesselLocation } from "ws-dottie";

// Type for regular JSON values
type ConvexJson =
  | string
  | number
  | boolean
  | null
  | ConvexJson[]
  | { [key: string]: ConvexJson };

// Type for Convex data (JSON + Date objects)
type JsonWithDate =
  | string
  | number
  | boolean
  | null
  | Date
  | JsonWithDate[]
  | { [key: string]: JsonWithDate };

// Type transformation: convert Date fields to number fields
type ConvertDatesToNumbers<T> = {
  [K in keyof T]: T[K] extends Date
    ? number
    : T[K] extends Date | null
      ? number | null
      : T[K];
};

// JSON reviver function to convert dates to timestamps
const toConvexReviver = (_: string, value: JsonWithDate): ConvexJson => {
  if (value instanceof Date) {
    return value.getTime();
  }
  // Handle date strings from WSF API
  if (
    typeof value === "string" &&
    value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  ) {
    return new Date(value).getTime();
  }
  // Handle null values for optional fields - return null instead of undefined
  if (value === null || value === undefined) {
    return null;
  }
  return value as ConvexJson;
};

// JSON reviver function to convert timestamps back to dates
const fromConvexReviver = (_: string, value: ConvexJson): JsonWithDate => {
  // Convert timestamp numbers back to Date objects
  if (typeof value === "number" && value > 1000000000000) {
    // Unix timestamp in milliseconds (after year 2001)
    return new Date(value);
  }
  return value as JsonWithDate;
};

// Convert any object to Convex format using JSON reviver
export const toConvex = <T>(obj: T): ConvertDatesToNumbers<T> => {
  return JSON.parse(JSON.stringify(obj), toConvexReviver);
};

// Convert Convex format back to any type using JSON reviver
export const fromConvex = <T>(convexData: ConvexJson): T => {
  return JSON.parse(JSON.stringify(convexData), fromConvexReviver);
};
