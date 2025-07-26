// Import terminal location data
import terminalLocations from "@assets/wsdot/terminalLocationsFiltered.json";
import type { VesselLocation } from "ws-dottie";

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
