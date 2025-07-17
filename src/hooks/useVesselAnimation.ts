import { destination, distance } from "@turf/turf";
import { useEffect, useRef, useState } from "react";
import type { VesselLocation } from "wsdot-api-client";
import { useVesselLocations } from "wsdot-api-client/react";

import { useInterval } from "@/hooks/useInterval";
import { toCoords } from "@/lib/utils";

// Constants for smoothing behavior
const SMOOTHING_INTERVAL_MS = 1000;
const SMOOTHING_PERIOD_MS = 15000;
const NEW_WEIGHT = SMOOTHING_INTERVAL_MS / SMOOTHING_PERIOD_MS;
const PREV_WEIGHT = 1 - NEW_WEIGHT;
const TELEPORT_THRESHOLD_KM = 0.5; // 500 meters
const COORDINATE_PRECISION = 6; // decimal places
const HEADING_THRESHOLD_DEGREES = 45; // degrees
const PROJECTION_TIME_SECONDS = SMOOTHING_PERIOD_MS / 1000; // seconds to project into the future
const KNOTS_TO_METERS_PER_SECOND = 0.514444;

/**
 * Custom hook that handles vessel position smoothing logic with projection.
 * Projects vessel positions 10 seconds into the future based on current speed and heading
 * to reduce perceived latency and provide smoother animations.
 */
export const useVesselAnimation = () => {
  const [smoothedVessels, setSmoothedVessels] = useState<VesselLocation[]>([]);
  const projectedVesselsRef = useRef<VesselLocation[]>([]);

  // Fetch vessel location data from WSF API
  const { data: currentVessels = [] } = useVesselLocations();

  // Handle vessel updates and store projected vessels
  useEffect(() => {
    if (currentVessels.length === 0) return;

    // Create projected vessels that are 15 seconds into the future
    const projectedVessels = currentVessels.map(projectVesselLocation);
    projectedVesselsRef.current = projectedVessels;

    // Add any new vessels that appeared
    const newVessels = getNewVessels(smoothedVessels, currentVessels);
    if (newVessels.length > 0) {
      setSmoothedVessels((prev) => [...prev, ...newVessels]);
    }
  }, [currentVessels, smoothedVessels.length, smoothedVessels]);

  // Continuous smoothing interval - runs every second
  useInterval(() => {
    if (!smoothedVessels.length || !projectedVesselsRef.current.length) return;

    // Apply smoothing between current smoothed vessels and projected vessels
    const newSmoothedVessels = applySmoothingToExistingVessels(
      smoothedVessels,
      projectedVesselsRef.current
    );

    setSmoothedVessels(newSmoothedVessels);
  }, SMOOTHING_INTERVAL_MS);

  return smoothedVessels;
};

/**
 * Apply exponential smoothing to vessel positions for smooth animations.
 * Uses 90% previous position + 10% current position for fluid movement.
 * Prevents smoothing when vessels teleport (route changes, docking).
 */
const applySmoothingToExistingVessels = (
  previousVessels: VesselLocation[],
  targetVessels: VesselLocation[]
): VesselLocation[] => {
  const targetVesselMap = new Map(
    targetVessels.map((vessel) => [vessel.VesselID, vessel])
  );

  return previousVessels
    .map((previousVessel) => {
      const targetVessel = targetVesselMap.get(previousVessel.VesselID);
      if (
        !targetVessel ||
        !hasValidCoordinates(targetVessel) ||
        !hasValidCoordinates(previousVessel)
      ) {
        return targetVessel || previousVessel;
      }

      // Check for teleportation
      if (
        calculateDistance(previousVessel, targetVessel) > TELEPORT_THRESHOLD_KM
      ) {
        return targetVessel;
      }

      // Apply smoothing
      return {
        ...targetVessel,
        Latitude: smoothCoordinate(
          previousVessel.Latitude,
          targetVessel.Latitude
        ),
        Longitude: smoothCoordinate(
          previousVessel.Longitude,
          targetVessel.Longitude
        ),
        Heading: smoothHeading(previousVessel.Heading, targetVessel.Heading),
      };
    })
    .filter((vessel) => vessel !== null);
};

// Helper functions
const isNumber = (value: unknown) =>
  typeof value === "number" && !Number.isNaN(value);

const hasValidCoordinates = (vessel: VesselLocation): boolean =>
  isNumber(vessel.Latitude) && isNumber(vessel.Longitude);

/**
 * Calculate great circle distance between two vessel positions using Turf.js.
 * Returns distance in kilometers - more accurate than simplified formula.
 */
const calculateDistance = (vp1: VesselLocation, vp2: VesselLocation): number =>
  distance(toCoords(vp1), toCoords(vp2), {
    units: "kilometers",
  });

/**
 * Apply exponential smoothing to coordinates and round to specified decimal places.
 * Provides ~1 meter precision which is sufficient for vessel tracking.
 */
const smoothCoordinate = (prevCoord: number, currentCoord: number): number => {
  const smoothed = PREV_WEIGHT * prevCoord + NEW_WEIGHT * currentCoord;
  const factor = 10 ** COORDINATE_PRECISION;
  return Math.round(smoothed * factor) / factor;
};

/**
 * Smooth heading values with simple linear interpolation.
 * If there's more than 45 degrees difference, use the new angle directly.
 */
const smoothHeading = (
  previousHeading: number,
  currentHeading: number
): number => {
  if (!isNumber(previousHeading) || !isNumber(currentHeading)) {
    return currentHeading;
  }

  // Calculate the shortest angular distance
  const diff = Math.abs(currentHeading - previousHeading);
  const shortestDiff = diff > 180 ? 360 - diff : diff;

  // If the difference is more than threshold, use the new angle directly
  if (shortestDiff > HEADING_THRESHOLD_DEGREES) {
    return currentHeading;
  }

  // Apply smoothing and normalize to 0-360 range
  const smoothed = smoothCoordinate(previousHeading, currentHeading);
  return ((smoothed % 360) + 360) % 360;
};

/**
 * Get vessels that are in current data but not in previous data.
 * These are newly appeared vessels that should be added without smoothing.
 */
const getNewVessels = (
  previousVessels: VesselLocation[],
  currentVessels: VesselLocation[]
): VesselLocation[] => {
  const existingVesselIds = new Set(previousVessels.map((v) => v.VesselID));
  return currentVessels.filter((v) => !existingVesselIds.has(v.VesselID));
};

/**
 * Project a vessel's position forward in time based on its current speed and heading.
 * Uses Turf.js destination function for accurate geographic projection.
 * Converts speed from knots to meters per second for distance calculation.
 * Returns the original vessel if projection is not possible or fails.
 */
const projectVesselLocation = (vessel: VesselLocation): VesselLocation => {
  if (
    !hasValidCoordinates(vessel) ||
    !isNumber(vessel.Speed) ||
    !isNumber(vessel.Heading)
  ) {
    return vessel;
  }

  // Skip projection if speed is too low or too high (likely invalid data)
  if (vessel.Speed < 1 || vessel.Speed > 40) {
    return vessel;
  }

  // Convert speed from knots to meters per second
  // 1 knot = 0.514444 meters per second
  const speedInMetersPerSecond = vessel.Speed * KNOTS_TO_METERS_PER_SECOND;

  // Project position forward in time based on current speed and heading
  const distanceInMeters = speedInMetersPerSecond * PROJECTION_TIME_SECONDS;
  const distanceInKilometers = distanceInMeters / 1000;

  try {
    const projectedPoint = destination(
      toCoords(vessel),
      distanceInKilometers,
      vessel.Heading,
      { units: "kilometers" }
    );

    return {
      ...vessel,
      Latitude: projectedPoint.geometry.coordinates[1],
      Longitude: projectedPoint.geometry.coordinates[0],
    };
  } catch (error) {
    // If projection fails, return original vessel
    console.warn(`Failed to project vessel ${vessel.VesselID}:`, error);
    return vessel;
  }
};
