import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { VesselPosition } from "@/data/shared/VesselLocation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Seattle coordinates [longitude, latitude]
 */
export const SEATTLE_COORDINATES: [number, number] = [-122.3321, 47.6062];

/**
 * Convert vessel position to coordinate array format expected by Turf.js
 * Returns [longitude, latitude] as required by Turf.js functions
 */
export const toCoords = (position: VesselPosition): [number, number] => [
  position.lon,
  position.lat,
];

/**
 * Convert coordinate array to vessel position format
 * Expects [longitude, latitude] as provided by Turf.js
 */
export const fromCoordinateArray = ([lon, lat]: [number, number]): Pick<
  VesselPosition,
  "lat" | "lon"
> => ({ lat, lon });

/**
 * Extract coordinates from vessel position for distance calculations
 * Returns [longitude, latitude] for Turf.js compatibility
 */
export const getCoordinates = (lat: number, lon: number): [number, number] => [
  lon,
  lat,
];
