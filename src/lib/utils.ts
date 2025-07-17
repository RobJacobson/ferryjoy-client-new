import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { VesselLocation } from "wsdot-api-client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

/**
 * Seattle coordinates [longitude, latitude]
 */
export const SEATTLE_COORDINATES: [number, number] = [-122.3321, 47.6062];

/**
 * Convert vessel position to coordinate array format expected by Turf.js
 * Returns [longitude, latitude] as required by Turf.js functions
 */
export const toCoords = (position: VesselLocation): [number, number] => [
  position.Longitude,
  position.Latitude,
];

/**
 * Extract latitude and longitude from a VesselLocation object
 */
export const extractLatLon = ({
  Latitude,
  Longitude,
}: Pick<VesselLocation, "Latitude" | "Longitude">): Pick<
  VesselLocation,
  "Latitude" | "Longitude"
> => ({ Latitude, Longitude });

/**
 * Extract coordinates from vessel position for distance calculations
 * Returns [longitude, latitude] for Turf.js compatibility
 */
export const getCoordinates = (
  latitude: number,
  longitude: number
): [number, number] => [longitude, latitude];
