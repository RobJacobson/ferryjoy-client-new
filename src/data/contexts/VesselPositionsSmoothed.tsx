import { destination, distance } from "@turf/turf";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  VesselLocation,
  VesselPosition,
} from "@/data/sources/wsf/vessels/vesselLocations";
import { useVesselLocations } from "@/data/sources/wsf/vessels/vesselLocations";
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
 * Context value providing smoothed vessel data for animation.
 * Uses exponential smoothing to create fluid vessel movement on maps.
 */
type VesselPositionsContextType = {
  smoothedVessels: VesselLocation[]; // Vessels with exponentially smoothed position/motion data
};

/**
 * React context for sharing smoothed vessel position data across the app.
 * Provides vessel tracking data with position smoothing for better UX.
 */
const VesselPositionsContext = createContext<
  VesselPositionsContextType | undefined
>(undefined);

/**
 * Provider component that fetches vessel location data from WSF API and applies exponential smoothing
 * with position projection for fluid animations. Projects vessels 10 seconds into the future to reduce
 * perceived latency. Updates in real-time via React Query while smoothing position changes.
 */
export const VesselPositionsProvider = ({ children }: PropsWithChildren) => {
  const smoothedVessels = useVesselSmoothing();

  return (
    <VesselPositionsContext.Provider value={{ smoothedVessels }}>
      {children}
    </VesselPositionsContext.Provider>
  );
};

/**
 * Hook to access smoothed vessel position data for fluid map animations.
 * Provides vessel locations with exponential smoothing applied for better UX.
 * Must be used within VesselPositionsProvider.
 */
export const useVesselPositionsSmoothed = () => {
  const context = useContext(VesselPositionsContext);
  if (context === undefined || context === null) {
    // Return a safe default instead of throwing an error
    return { smoothedVessels: [] };
  }
  return context;
};

/**
 * Custom hook that handles vessel position smoothing logic with projection.
 * Projects vessel positions 10 seconds into the future based on current speed and heading
 * to reduce perceived latency and provide smoother animations.
 */
const useVesselSmoothing = () => {
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
    targetVessels.map((vessel) => [vessel.vesselID, vessel])
  );

  return previousVessels
    .map((previousVessel) => {
      const targetVessel = targetVesselMap.get(previousVessel.vesselID);
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
        lat: smoothCoordinate(previousVessel.lat, targetVessel.lat),
        lon: smoothCoordinate(previousVessel.lon, targetVessel.lon),
        heading: smoothHeading(previousVessel.heading, targetVessel.heading),
      };
    })
    .filter((vessel) => vessel !== null);
};

// Helper functions
const isNumber = (value: unknown) =>
  typeof value === "number" && !Number.isNaN(value);

const hasValidCoordinates = (vessel: VesselPosition): boolean =>
  isNumber(vessel.lat) && isNumber(vessel.lon);

/**
 * Calculate great circle distance between two vessel positions using Turf.js.
 * Returns distance in kilometers - more accurate than simplified formula.
 */
const calculateDistance = (vp1: VesselPosition, vp2: VesselPosition): number =>
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
  const existingVesselIds = new Set(previousVessels.map((v) => v.vesselID));
  return currentVessels.filter((v) => !existingVesselIds.has(v.vesselID));
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
    !isNumber(vessel.speed) ||
    !isNumber(vessel.heading)
  ) {
    return vessel;
  }

  // Skip projection if speed is too low or too high (likely invalid data)
  if (vessel.speed < 1 || vessel.speed > 40) {
    return vessel;
  }

  // Convert speed from knots to meters per second
  // 1 knot = 0.514444 meters per second
  const speedInMetersPerSecond = vessel.speed * KNOTS_TO_METERS_PER_SECOND;

  // Project position forward in time based on current speed and heading
  const distanceInMeters = speedInMetersPerSecond * PROJECTION_TIME_SECONDS;
  const distanceInKilometers = distanceInMeters / 1000;

  try {
    const projectedPoint = destination(
      toCoords(vessel),
      distanceInKilometers,
      vessel.heading,
      { units: "kilometers" }
    );

    return {
      ...vessel,
      lat: projectedPoint.geometry.coordinates[1],
      lon: projectedPoint.geometry.coordinates[0],
    };
  } catch (error) {
    // If projection fails, return original vessel
    console.warn(`Failed to project vessel ${vessel.vesselID}:`, error);
    return vessel;
  }
};
