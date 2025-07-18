import { destination, distance } from "@turf/turf";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VesselLocation } from "wsdot-api-client";

import { useCurrentVesselLocation } from "@/hooks/useCurrentVesselLocation";
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
// const PROJECTION_TIME_SECONDS = SMOOTHING_PERIOD_MS / 1000; // seconds to project into the future
// const KNOTS_TO_METERS_PER_SECOND = 0.514444;

/**
 * Custom hook that handles vessel position smoothing logic using moving average.
 * Smoothly interpolates vessel positions towards current data to provide fluid animations.
 */
export const useVesselAnimation = () => {
  const [smoothedVessels, setSmoothedVessels] = useState<VesselLocation[]>([]);
  const previousVesselsRef = useRef<VesselLocation[]>([]);
  const currentVesselsRef = useRef<VesselLocation[]>([]);
  const smoothedVesselsRef = useRef<VesselLocation[]>([]);

  // Fetch filtered vessel location data
  const currentVessels = useCurrentVesselLocation();

  // Update the ref with current vessels
  useEffect(() => {
    currentVesselsRef.current = currentVessels;
  }, [currentVessels]);

  // Update the ref with smoothed vessels
  useEffect(() => {
    smoothedVesselsRef.current = smoothedVessels;
  }, [smoothedVessels]);

  // Handle vessel updates
  useEffect(() => {
    if (currentVessels.length === 0) return;

    // Add any new vessels that appeared
    const newVessels = getNewVessels(
      previousVesselsRef.current,
      currentVessels
    );
    if (newVessels.length > 0) {
      setSmoothedVessels((prev) => [...prev, ...newVessels]);
    }

    // Update the ref with current vessels for next comparison
    previousVesselsRef.current = currentVessels;
  }, [currentVessels]);

  // Continuous smoothing interval - runs every second
  const smoothingCallback = useCallback(() => {
    const currentVessels = currentVesselsRef.current;
    const smoothedVessels = smoothedVesselsRef.current;
    if (!smoothedVessels.length || !currentVessels.length) return;

    // Apply smoothing between current smoothed vessels and filtered vessels
    const newSmoothedVessels = applySmoothingToExistingVessels(
      smoothedVessels,
      currentVessels
    );

    setSmoothedVessels(newSmoothedVessels);
  }, []);

  useInterval(smoothingCallback, SMOOTHING_INTERVAL_MS);

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
      if (!targetVessel) {
        return previousVessel;
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
    .filter((vessel): vessel is VesselLocation => vessel !== null);
};

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
  if (!previousHeading) {
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
 * Creates a Set of existing vessel IDs for efficient lookup.
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
 *
 * TEMPORARILY DISABLED - Commented out for moving average approach
 */
/*
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
*/
