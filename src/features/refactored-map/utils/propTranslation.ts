/**
 * Property translation utilities for mapbox APIs
 * Handles conversion between native (camelCase) and web (kebab-case) property formats
 */

/**
 * Mapbox style property types
 * These represent the actual style properties we'll be translating
 */
export type NativeStyleProps = {
  circleColor?: string;
  circleRadius?: number;
  circleOpacity?: number;
  lineColor?: string;
  lineWidth?: number | unknown[];
  lineOpacity?: number | unknown[];
  lineDasharray?: unknown[];
  lineCap?: string;
  fillColor?: string;
  fillOpacity?: number;
  symbolSize?: number;
  symbolColor?: string;
  [key: string]: unknown; // Allow other properties
};

export type WebStyleProps = {
  "circle-color"?: string;
  "circle-radius"?: number;
  "circle-opacity"?: number;
  "line-color"?: string;
  "line-width"?: number | unknown[];
  "line-opacity"?: number | unknown[];
  "line-dasharray"?: unknown[];
  "line-cap"?: string;
  "fill-color"?: string;
  "fill-opacity"?: number;
  "symbol-size"?: number;
  "symbol-color"?: string;
  [key: string]: unknown; // Allow other properties
};

/**
 * Mapbox component prop types
 * These represent the actual component props we'll be translating
 */
export type NativeComponentProps = {
  sourceID?: string;
  sourceLayerID?: string;
  filter?: unknown[];
  [key: string]: unknown; // Allow other properties
};

export type WebComponentProps = {
  source?: string;
  "source-layer"?: string;
  filter?: unknown[];
  [key: string]: unknown; // Allow other properties
};

/**
 * Convert camelCase to kebab-case for web platform
 */
const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
};

/**
 * Recursively convert object keys from camelCase to kebab-case
 */
const camelToKebabObject = (
  obj: Record<string, unknown>
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [camelToKebab(key), value])
  );

/**
 * Remove undefined values from object
 */
const filterUndefined = (
  obj: Record<string, unknown>
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );

/**
 * Convert native style props to web format (camelCase to kebab-case)
 */
export const toWebStyleProps = (props: NativeStyleProps): WebStyleProps =>
  filterUndefined(camelToKebabObject(props)) as WebStyleProps;

/**
 * Convert native component props to web format (camelCase to kebab-case)
 */
export const toWebComponentProps = (
  props: NativeComponentProps
): WebComponentProps =>
  filterUndefined(camelToKebabObject(props)) as WebComponentProps;
