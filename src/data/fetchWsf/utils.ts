// WSF API Utilities

// Fields to exclude from WSF API responses
const EXCLUDED_FIELDS = [
  "Mmsi",
  "EtaBasis",
  "VesselWatchShutID",
  "VesselWatchShutMsg",
  "VesselWatchShutFlag",
  "VesselWatchStatus",
  "VesselWatchMsg",
] as const;

/**
 * Checks if a value is a WSF date string
 */
function isWSFDateString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/Date(") &&
    value.endsWith(")/")
  );
}

/**
 * Parses WSF API date strings in format "/Date(1750981529000-0700)/" to JavaScript Date objects
 */
function parseWSFDate(dateString: string): Date | null {
  // Extract timestamp portion: /Date(1750981529000-0700)/ -> 1750981529000
  const middle = dateString.slice(6, -2);
  const timezoneIndex = middle.indexOf("-");
  const timestampStr =
    timezoneIndex !== -1 ? middle.slice(0, timezoneIndex) : middle;

  const timestamp = parseInt(timestampStr, 10);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

/**
 * JSON reviver for WSF API responses - converts dates and filters unwanted fields
 */
export function wsfApiReviver(key: string, value: unknown): unknown {
  // Skip excluded fields
  if (EXCLUDED_FIELDS.includes(key as (typeof EXCLUDED_FIELDS)[number])) {
    return undefined;
  }

  // Convert OpRouteAbbrev array to first string entry for VesselLocation
  if (key === "OpRouteAbbrev") {
    return Array.isArray(value) && value.length > 0 ? value[0] : null;
  }

  // Convert Class object to string for display
  if (key === "Class" && typeof value === "object" && value !== null) {
    const classObj = value as any;
    return classObj.ClassName || classObj.PublicDisplayName || "Unknown";
  }

  // Convert date strings to Date objects
  return isWSFDateString(value) ? parseWSFDate(value) : value;
}
