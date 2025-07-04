import { useQuery } from "convex/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { api } from "@/data/convex/_generated/api";
import {
  toVesselLocationFromConvex,
  type VesselLocation,
} from "@/data/shared/VesselLocation";

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

type VesselPositionsProviderProps = {
  children: ReactNode;
};

/**
 * Provider component that fetches vessel location data from Convex and applies exponential smoothing
 * for fluid animations. Updates in real-time via Convex reactive queries while smoothing position changes.
 */
export const VesselPositionsProvider = ({
  children,
}: VesselPositionsProviderProps) => {
  const [smoothedVessels, setSmoothedVessels] = useState<VesselLocation[]>([]);
  const targetVesselsRef = useRef<VesselLocation[]>([]);
  const smoothedVesselsRef = useRef<VesselLocation[]>([]);

  // Fetch vessel location data from Convex current table
  const convexVessels = useQuery(
    api.vesselLocationsCurrent.vesselLocationCurrentQueries
      .getAllVesselLocationsCurrent
  );

  // Transform Convex data to VesselLocation format
  const currentVessels: VesselLocation[] = convexVessels
    ? convexVessels.map(toVesselLocationFromConvex)
    : [];

  // Update target vessels when new data arrives from Convex
  useEffect(() => {
    if (currentVessels.length === 0) return;

    // For first load or when switching from empty to populated data
    if (targetVesselsRef.current.length === 0) {
      setSmoothedVessels(currentVessels);
      targetVesselsRef.current = currentVessels;
      smoothedVesselsRef.current = currentVessels;
      return;
    }

    // Update target vessels with new data from Convex
    targetVesselsRef.current = currentVessels;
  }, [currentVessels]);

  // Continuous smoothing interval - runs every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        targetVesselsRef.current.length === 0 ||
        smoothedVesselsRef.current.length === 0
      ) {
        return;
      }

      // Apply smoothing between current smoothed position and target position
      const newSmoothedVessels = applySmoothingToExistingVessels(
        smoothedVesselsRef.current,
        targetVesselsRef.current
      );

      // Add any new vessels that weren't in the previous smoothed data
      const newVessels = getNewVessels(
        smoothedVesselsRef.current,
        targetVesselsRef.current
      );

      const allVessels = [...newSmoothedVessels, ...newVessels];

      // Update both state and ref
      setSmoothedVessels(allVessels);
      smoothedVesselsRef.current = allVessels;
    }, 1000); // Run every second for smooth animation

    return () => clearInterval(interval);
  }, []);

  const value: VesselPositionsContextType = {
    smoothedVessels,
  };

  return (
    <VesselPositionsContext.Provider value={value}>
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
 * Apply exponential smoothing to vessel positions for smooth animations.
 * Uses 90% previous position + 10% current position for fluid movement.
 * Prevents smoothing when vessels teleport (route changes, docking).
 */
const applySmoothingToExistingVessels = (
  previousVessels: VesselLocation[],
  currentVessels: VesselLocation[]
): VesselLocation[] => {
  // Create a map for efficient lookup of current vessels by ID
  const currentVesselMap = new Map(
    currentVessels.map((vessel) => [vessel.vesselID, vessel])
  );

  return previousVessels
    .map((smoothedVessel) => {
      const currentVessel = currentVesselMap.get(smoothedVessel.vesselID);

      if (!currentVessel) {
        // Vessel no longer exists in current data, remove it
        return null;
      }

      // Check if current vessel has valid coordinates
      if (
        typeof currentVessel.lat !== "number" ||
        typeof currentVessel.lon !== "number" ||
        Number.isNaN(currentVessel.lat) ||
        Number.isNaN(currentVessel.lon)
      ) {
        // Invalid coordinates in current data, keep previous position
        return smoothedVessel;
      }

      // Check if smoothed vessel has valid coordinates
      if (
        typeof smoothedVessel.lat !== "number" ||
        typeof smoothedVessel.lon !== "number" ||
        Number.isNaN(smoothedVessel.lat) ||
        Number.isNaN(smoothedVessel.lon)
      ) {
        // Previous smoothed position is invalid, use current position directly
        return currentVessel;
      }

      // Calculate distance between previous and current position
      const distance = calculateDistance(
        smoothedVessel.lat,
        smoothedVessel.lon,
        currentVessel.lat,
        currentVessel.lon
      );

      // If the vessel has moved significantly (more than ~500 meters), don't smooth
      // This prevents smoothing when vessels teleport between routes or docks
      if (distance > 0.0045) {
        return currentVessel;
      }

      // Apply exponential smoothing to coordinates and heading
      // 90% previous position + 10% current position for smooth movement
      return {
        ...currentVessel, // Use all current data (timestamps, status, etc.)
        lat: roundCoordinate(
          0.9 * smoothedVessel.lat + 0.1 * currentVessel.lat
        ),
        lon: roundCoordinate(
          0.9 * smoothedVessel.lon + 0.1 * currentVessel.lon
        ),
        heading: smoothHeading(smoothedVessel.heading, currentVessel.heading),
      };
    })
    .filter((vessel): vessel is VesselLocation => vessel !== null);
};

/**
 * Calculate distance between two coordinates using simplified distance formula.
 * Returns distance in degrees (approximate) - sufficient for teleport detection.
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;
  return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
};

/**
 * Round coordinates to 6 decimal places for consistency.
 * Provides ~1 meter precision which is sufficient for vessel tracking.
 */
const roundCoordinate = (coord: number): number => {
  return Math.round(coord * 1000000) / 1000000;
};

/**
 * Smooth heading values with proper circular interpolation.
 * Handles wraparound at 0°/360° to prevent jerky rotation animations.
 */
const smoothHeading = (
  previousHeading: number,
  currentHeading: number
): number => {
  // If either heading is invalid, use the current heading
  if (
    typeof previousHeading !== "number" ||
    typeof currentHeading !== "number" ||
    Number.isNaN(previousHeading) ||
    Number.isNaN(currentHeading)
  ) {
    return currentHeading;
  }

  // Normalize headings to 0-360 range
  const prevNorm = ((previousHeading % 360) + 360) % 360;
  const currNorm = ((currentHeading % 360) + 360) % 360;

  // Calculate the shortest angular distance
  let diff = currNorm - prevNorm;
  if (diff > 180) {
    diff -= 360;
  } else if (diff < -180) {
    diff += 360;
  }

  // Apply smoothing: 90% previous + 10% of the shortest path to current
  const smoothed = prevNorm + 0.1 * diff;

  // Normalize result to 0-360 range
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

  // Return current vessels that don't exist in previous data
  return currentVessels.filter((v) => !existingVesselIds.has(v.vesselID));
};
