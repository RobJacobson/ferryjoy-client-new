import { distance } from "@turf/turf";
import { useEffect, useRef, useState } from "react";
import type { VesselLocation } from "ws-dottie";

import { useVesselLocations } from "@/data/contexts";
import { log } from "@/shared/lib/logger";
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

type VesselsRecord = Record<number, VesselLocation>;

/**
 * Hook that provides smoothly animated vessel positions for map visualization.
 *
 * Implements exponential smoothing to create fluid vessel movement between GPS updates.
 * Runs a continuous animation loop that updates vessel positions every second,
 * blending current GPS data with previous positions for natural movement.
 *
 * @returns Array of smoothly animated vessel locations
 */
export const useAnimatedVesselLocations = () => {
  const [animatedVessels, setAnimatedVessels] = useState<VesselLocation[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );

  // Get real-time vessel location data (~every 5 seconds)
  const { vesselLocations: currentVessels } = useVesselLocations();

  // Add new vessels to the animation system
  // biome-ignore lint/correctness/useExhaustiveDependencies: only depends on currentVessels
  useEffect(() => {
    const newVesselLocations = getNewVessels(animatedVessels, currentVessels);
    if (newVesselLocations.length > 0) {
      setAnimatedVessels((prev) => [...prev, ...newVesselLocations]);
    }
  }, [currentVessels]);

  // Continuous animation loop - updates vessel positions every second
  useEffect(() => {
    // Schedule animation frames
    intervalRef.current = setInterval(() => {
      setAnimatedVessels((prev) => animateVesselsSafe(prev, currentVessels));
    }, SMOOTHING_INTERVAL_MS);

    // Cleanup timer on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [currentVessels]);

  // Return array of vessel locations
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
 * @returns Array of new vessels to add
 */
const getNewVessels = (
  animatedVessels: VesselLocation[],
  currentVessels: VesselLocation[]
): VesselLocation[] => {
  const animatedVesselsSet = toVesselsSet(animatedVessels);
  return currentVessels.filter(
    (vessel) => !animatedVesselsSet.has(vessel.VesselID)
  );
};

/**
 * Safe wrapper for animateVessels that provides graceful degradation on errors.
 *
 * If animation succeeds, returns smoothly animated vessel positions.
 * If animation fails, logs the error and returns current vessel positions as fallback.
 * This ensures the map continues to show vessel positions even if animation logic fails.
 *
 * @param animatedVessels Currently smoothed vessel positions
 * @param currentVessels Latest GPS vessel location data
 * @returns Either animated vessels or current vessels as fallback
 */
const animateVesselsSafe = (
  animatedVessels: VesselLocation[],
  currentVessels: VesselLocation[]
): VesselLocation[] => {
  try {
    return animateVessels(animatedVessels, currentVessels);
  } catch (error) {
    log.error("Animation failed, falling back to current vessel positions", {
      error: error instanceof Error ? error.message : String(error),
      animatedVesselCount: animatedVessels.length,
      currentVesselCount: currentVessels.length,
    });
    return currentVessels;
  }
};

/**
 * Converts an array of vessels to a Set of VesselIDs for efficient O(1) lookups.
 * Used to quickly check if a vessel is already being animated.
 *
 * @param vessels Array of vessel locations
 * @returns Set of VesselIDs
 */
const toVesselsSet = (vessels: VesselLocation[]): Set<number> =>
  new Set(vessels.map((vessel) => vessel.VesselID));

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
  const currentVesselsRecord = toVesselsRecord(currentVessels);
  return animatedVessels
    .map((animatedVessel) => {
      try {
        const currentVessel = currentVesselsRecord[animatedVessel.VesselID];

        // Keep existing vessel if no current data available
        if (!currentVessel) {
          return animatedVessel;
        }

        // Detect teleportation (sudden large position changes)
        if (
          calculateDistance(animatedVessel, currentVessel) >
          TELEPORT_THRESHOLD_KM
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
      } catch (error) {
        log.error("Error animating vessel", {
          vesselId: animatedVessel.VesselID,
          error: error instanceof Error ? error.message : String(error),
        });
        return undefined;
      }
    })
    .filter((vessel): vessel is VesselLocation => vessel !== undefined);
};

/**
 * Converts an array of vessels to a record for efficient O(1) lookups.
 * Used to avoid O(n²) complexity when finding current vessel data.
 *
 * @param vessels Array of vessel locations
 * @returns Record mapping VesselID to VesselLocation
 */
const toVesselsRecord = (vessels: VesselLocation[]): VesselsRecord =>
  vessels.reduce((acc, vessel) => {
    acc[vessel.VesselID] = vessel;
    return acc;
  }, {} as VesselsRecord);

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
