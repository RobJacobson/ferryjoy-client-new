// WSF shared utilities

/**
 * Type representing JSON-like data that can be transformed
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Type representing transformed data (with Date objects and camelCase keys)
 */
export type TransformedValue =
  | string
  | number
  | boolean
  | null
  | Date
  | TransformedValue[]
  | { [key: string]: TransformedValue };

/**
 * Checks if a string matches YYYY-MM-DD date format
 */
const isYyyyMmDdDate = (str: string): boolean => {
  const yyyyMmDdRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!yyyyMmDdRegex.test(str)) return false;

  // Validate the date is actually valid
  const date = new Date(str);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().split("T")[0] === str
  );
};

/**
 * Checks if a string matches MM/DD/YYYY date format
 */
const isMmDdYyyyDate = (str: string): boolean => {
  const mmDdYyyyRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (!mmDdYyyyRegex.test(str)) return false;

  // Validate the date is actually valid
  const [month, day, year] = str.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getFullYear() === year
  );
};

/**
 * Converts a string to a Date object based on its format
 */
const parseDateString = (dateString: string): Date | null => {
  // Handle WSF /Date(timestamp)/ format
  if (dateString.startsWith("/Date(")) {
    const middle = dateString.slice(6, 19);
    const timestamp = parseInt(middle);
    return new Date(timestamp);
  }

  // Handle YYYY-MM-DD format
  if (isYyyyMmDdDate(dateString)) {
    return new Date(dateString);
  }

  // Handle MM/DD/YYYY format
  if (isMmDdYyyyDate(dateString)) {
    const [month, day, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  return null;
};

/**
 * Recursively transforms WSF API response data:
 * 1. Converts WSF date strings to JavaScript Date objects
 * 2. Converts PascalCase keys to camelCase
 * 3. Handles nested objects and arrays
 */
export const transformWsfData = (data: JsonValue): TransformedValue => {
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(transformWsfData);
  }

  // Handle objects (but not Date objects, which are also typeof 'object')
  if (data && typeof data === "object" && data.constructor === Object) {
    const result: { [key: string]: TransformedValue } = {};
    for (const [key, value] of Object.entries(data)) {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      result[camelKey] = transformWsfData(value);
    }
    return result;
  }

  // Handle date strings
  if (typeof data === "string") {
    const parsedDate = parseDateString(data);
    if (parsedDate) {
      return parsedDate;
    }
  }

  // Return primitives as-is
  return data;
};
