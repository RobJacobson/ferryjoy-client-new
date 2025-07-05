import { distance } from "@turf/turf";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useVesselLocations } from "@/data/fetchWsf/vessels/useVesselLocations";
import type {
  VesselLocation,
  VesselPosition,
} from "@/data/shared/VesselLocation";
import { toCoords } from "@/lib/utils";

// Constants for smoothing behavior
const SMOOTHING_INTERVAL_MS = 1000;
const NEW_WEIGHT = 0.1; // 10% new data, 90% previous
const PREV_WEIGHT = 1 - NEW_WEIGHT;
const TELEPORT_THRESHOLD_KM = 0.5; // 500 meters
const COORDINATE_PRECISION = 6; // decimal places
const HEADING_THRESHOLD_DEGREES = 45; // degrees

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
 * for fluid animations. Updates in real-time via React Query while smoothing position changes.
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
  if (context === undefined) {
    throw new Error(
      "useVesselPositionsSmoothed must be used within a VesselPositionsProvider"
    );
  }
  return context;
};

/**
 * Custom hook that handles vessel position smoothing logic
 */
const useVesselSmoothing = () => {
  const [smoothedVessels, setSmoothedVessels] = useState<VesselLocation[]>([]);
  const targetVesselsRef = useRef<VesselLocation[]>([]);
  const smoothedVesselsRef = useRef<VesselLocation[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );

  // Fetch vessel location data from WSF API
  const { data: currentVessels = [] } = useVesselLocations();

  // Update smoothed vessels ref when state changes
  useEffect(() => {
    smoothedVesselsRef.current = smoothedVessels;
  }, [smoothedVessels]);

  // Update target vessels when new data arrives from WSF API
  useEffect(() => {
    if (currentVessels.length === 0) return;

    // For first load or when switching from empty to populated data
    if (targetVesselsRef.current.length === 0) {
      setSmoothedVessels(currentVessels);
      targetVesselsRef.current = currentVessels;
      return;
    }

    // Update target vessels with new data from WSF API
    targetVesselsRef.current = currentVessels;
  }, [currentVessels]);

  // Continuous smoothing interval - runs every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (
        !targetVesselsRef.current.length ||
        !smoothedVesselsRef.current.length
      ) {
        return;
      }

      const newSmoothedVessels = applySmoothingToExistingVessels(
        smoothedVesselsRef.current,
        targetVesselsRef.current
      );

      const newVessels = getNewVessels(
        smoothedVesselsRef.current,
        targetVesselsRef.current
      );

      setSmoothedVessels([...newSmoothedVessels, ...newVessels]);
    }, SMOOTHING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array - no infinite loop!

  return smoothedVessels;
};

/**
 * Apply exponential smoothing to vessel positions for smooth animations.
 * Uses 90% previous position + 10% current position for fluid movement.
 * Prevents smoothing when vessels teleport (route changes, docking).
 */
const applySmoothingToExistingVessels = (
  previousVessels: VesselLocation[],
  currentVessels: VesselLocation[]
): VesselLocation[] => {
  const currentVesselMap = new Map(
    currentVessels.map((vessel) => [vessel.vesselID, vessel])
  );

  return previousVessels
    .map((smoothedVessel) => {
      const currentVessel = currentVesselMap.get(smoothedVessel.vesselID);
      if (!currentVessel) return null;

      // Validate coordinates
      if (!hasValidCoordinates(currentVessel)) return smoothedVessel;
      if (!hasValidCoordinates(smoothedVessel)) return currentVessel;

      // Check for teleportation
      if (
        calculateDistance(smoothedVessel, currentVessel) > TELEPORT_THRESHOLD_KM
      ) {
        return currentVessel;
      }

      // Apply smoothing
      return {
        ...currentVessel,
        lat: roundCoordinate(smoothedVessel.lat, currentVessel.lat),
        lon: roundCoordinate(smoothedVessel.lon, currentVessel.lon),
        heading: smoothHeading(smoothedVessel.heading, currentVessel.heading),
      };
    })
    .filter((vessel): vessel is VesselLocation => vessel !== null);
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
const roundCoordinate = (prevCoord: number, currentCoord: number): number => {
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
  const smoothed = roundCoordinate(previousHeading, currentHeading);
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
