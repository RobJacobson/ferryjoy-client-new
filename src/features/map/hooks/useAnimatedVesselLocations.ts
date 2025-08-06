import { distance } from "@turf/turf";
import { useEffect, useRef, useState } from "react";
import type { VesselLocation } from "ws-dottie";

import { useVesselLocations } from "@/data/contexts";
import { toCoords } from "@/shared/lib/utils/coordinates";

// Animation timing constants
const SMOOTHING_INTERVAL_MS = 1000; // Update animation every second
const SMOOTHING_PERIOD_MS = 15000; // 15-second smoothing window
const NEW_WEIGHT = SMOOTHING_INTERVAL_MS / SMOOTHING_PERIOD_MS; // 0.067 (6.7% new data weight)
const PREV_WEIGHT = 1 - NEW_WEIGHT; // 0.933 (93.3% previous data weight)

// Thresholds for vessel behavior
const TELEPORT_THRESHOLD_KM = 0.5; // Detect teleportation beyond 500m
const COORDINATE_PRECISION = 6; // ~1 meter precision (6 decimal places)
const HEADING_THRESHOLD_DEGREES = 45; // Snap to new heading if >45° difference

/**
 * Hook that provides smoothly animated vessel positions for map visualization.
 *
 * Implements exponential smoothing to create fluid vessel movement between GPS updates.
 * Runs a continuous animation loop that updates vessel positions every second,
 * blending current GPS data with previous positions for natural movement.
 *
 * @returns Array of smoothly animated vessel locations
 */
export const useAnimatedVessels = () => {
  const [animatedVessels, setAnimatedVessels] = useState<VesselLocation[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );

  // Get real-time vessel location data (~every 5 seconds)
  const { vesselLocations: currentLocations } = useVesselLocations();

  // Add new vessels to the animation system
  useEffect(() => {
    setAnimatedVessels((prev) => getNewVessels(prev, currentLocations));
  }, [currentLocations]);

  // Continuous animation loop - updates vessel positions every second
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on timer
  useEffect(() => {
    // Schedule animation frames
    intervalRef.current = setInterval(() => {
      setAnimatedVessels((prev) => animateVessels(prev, currentLocations));
    }, SMOOTHING_INTERVAL_MS);

    // Cleanup timer on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, []);

  return animatedVessels;
};

/**
 * Identifies and adds newly appeared vessels to the animation system.
 *
 * Compares current vessel data with animated vessels to find vessels
 * that have appeared but aren't yet being animated. These new vessels
 * are added to the animation system without smoothing for immediate display.
 *
 * @param animatedVessels Currently animated vessels
 * @param currentVessels Latest vessel location data
 * @returns Combined array with new vessels added
 */
const getNewVessels = (
  animatedVessels: VesselLocation[],
  currentVessels: VesselLocation[]
) => {
  // Create efficient lookup set of currently animated vessel IDs
  const currentAnimatedVessels = new Set(
    animatedVessels.map((v) => v.VesselID)
  );

  // Find vessels that exist in current data but not in animated vessels
  const newVesselLocations = currentVessels.filter(
    (vessel) => !currentAnimatedVessels.has(vessel.VesselID)
  );

  return [...animatedVessels, ...newVesselLocations];
};

/**
 * Applies exponential smoothing to vessel positions for fluid map animations.
 *
 * Creates smooth transitions between GPS updates by blending current and previous
 * positions. Uses 93.3% previous position + 6.7% current position for natural
 * movement. Detects teleportation events (route changes, docking) and snaps
 * to new position instead of smoothing.
 *
 * @param animatedVessels Currently smoothed vessel positions
 * @param currentVessels Latest GPS vessel location data
 * @returns Array of smoothly animated vessel positions
 */
const animateVessels = (
  animatedVessels: VesselLocation[],
  currentVessels: VesselLocation[]
): VesselLocation[] => {
  // Create efficient lookup map for current vessel data
  const currentVesselMap = new Map(
    currentVessels.map((vessel) => [vessel.VesselID, vessel])
  );

  return animatedVessels
    .map((animatedVessel) => {
      const currentVessel = currentVesselMap.get(animatedVessel.VesselID);

      // Keep existing vessel if no current data available
      if (!currentVessel) {
        return animatedVessel;
      }

      // Detect teleportation (sudden large position changes)
      if (
        calculateDistance(animatedVessel, currentVessel) > TELEPORT_THRESHOLD_KM
      ) {
        return currentVessel; // Snap to new position
      }

      // Apply exponential smoothing to coordinates and heading
      return {
        ...currentVessel,
        Latitude: smoothCoordinate(
          animatedVessel.Latitude,
          currentVessel.Latitude
        ),
        Longitude: smoothCoordinate(
          animatedVessel.Longitude,
          currentVessel.Longitude
        ),
        Heading: smoothHeading(animatedVessel.Heading, currentVessel.Heading),
      };
    })
    .filter((vessel) => vessel !== null);
};

/**
 * Calculates great circle distance between two vessel positions using Turf.js.
 *
 * Uses accurate geodesic calculations for precise distance measurement.
 * More reliable than simplified Euclidean distance for geographic coordinates.
 *
 * @param vp1 First vessel position
 * @param vp2 Second vessel position
 * @returns Distance in kilometers
 */
const calculateDistance = (vp1: VesselLocation, vp2: VesselLocation): number =>
  distance(toCoords(vp1), toCoords(vp2), {
    units: "kilometers",
  });

/**
 * Applies exponential smoothing to geographic coordinates.
 *
 * Blends previous and current coordinates using weighted average for smooth
 * transitions. Rounds to 6 decimal places (~1 meter precision) to prevent
 * floating-point precision issues while maintaining sufficient accuracy.
 *
 * @param prevCoord Previous coordinate value
 * @param currentCoord Current coordinate value
 * @returns Smoothed coordinate rounded to specified precision
 */
const smoothCoordinate = (prevCoord: number, currentCoord: number): number => {
  // Apply exponential smoothing: 93.3% previous + 6.7% current
  const smoothed = PREV_WEIGHT * prevCoord + NEW_WEIGHT * currentCoord;

  // Round to specified decimal places to prevent precision drift
  const factor = 10 ** COORDINATE_PRECISION;
  return Math.round(smoothed * factor) / factor;
};

/**
 * Applies intelligent smoothing to vessel heading values.
 *
 * Handles circular nature of heading values (0-360°) by calculating shortest
 * angular distance. Snaps to new heading if difference exceeds threshold,
 * otherwise applies exponential smoothing. Normalizes result to 0-360° range.
 *
 * @param previousHeading Previous heading value (0-360°)
 * @param currentHeading Current heading value (0-360°)
 * @returns Smoothed heading value (0-360°)
 */
const smoothHeading = (
  previousHeading: number,
  currentHeading: number
): number => {
  // Use current heading if no previous value exists
  if (!previousHeading) {
    return currentHeading;
  }

  // Calculate shortest angular distance (handles 0°/360° wrap-around)
  const diff = Math.abs(currentHeading - previousHeading);
  const shortestDiff = diff > 180 ? 360 - diff : diff;

  // Snap to new heading if difference exceeds threshold
  if (shortestDiff > HEADING_THRESHOLD_DEGREES) {
    return currentHeading;
  }

  // Apply exponential smoothing and normalize to 0-360° range
  const smoothed = smoothCoordinate(previousHeading, currentHeading);
  const normalized = ((smoothed % 360) + 360) % 360;
  return Math.round(normalized * 100) / 100; // Round to 0.01° precision
};
