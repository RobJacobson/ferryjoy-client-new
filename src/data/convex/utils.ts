import type { VesselLocation } from "ws-dottie";

// JSON reviver function to convert dates to timestamps
const toConvexReviver = (_: string, value: any) => {
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
  // Handle null values for optional fields
  if (value === null || value === undefined) {
    return undefined;
  }
  return value;
};

// JSON reviver function to convert timestamps back to dates
const fromConvexReviver = (_: string, value: any) => {
  // Convert timestamp numbers back to Date objects
  if (typeof value === "number" && value > 1000000000000) {
    // Unix timestamp in milliseconds (after year 2001)
    return new Date(value);
  }
  return value;
};

// Convert VesselLocation to Convex format using JSON reviver
export const toConvex = (location: VesselLocation) => {
  return JSON.parse(JSON.stringify(location), toConvexReviver);
};

// Convert Convex format back to VesselLocation using JSON reviver
export const fromConvex = (convexData: any): VesselLocation => {
  return JSON.parse(JSON.stringify(convexData), fromConvexReviver);
};

// Generic timestamp detection for any object
export const convertDatesToTimestamps = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj), toConvexReviver);
};

// Generic timestamp conversion back to dates
export const convertTimestampsToDates = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj), fromConvexReviver);
};
