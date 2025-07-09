import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { VesselLocation } from "@/data/wsf/vessels/types";

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
export const toCoords = (position: VesselLocation): [number, number] => [
  position.longitude,
  position.latitude,
];

/**
 * Extract latitude and longitude from a VesselLocation object
 */
export const extractLatLon = ({
  latitude,
  longitude,
}: Pick<VesselLocation, "latitude" | "longitude">): Pick<
  VesselLocation,
  "latitude" | "longitude"
> => ({ latitude, longitude });

/**
 * Extract coordinates from vessel position for distance calculations
 * Returns [longitude, latitude] for Turf.js compatibility
 */
export const getCoordinates = (
  latitude: number,
  longitude: number
): [number, number] => [longitude, latitude];
