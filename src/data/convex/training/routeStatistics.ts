import { log } from "@/shared/lib/logger";

import type { RouteGroup, RouteStatistics } from "./types";

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Calculates statistics for a route group
 */
export const calculateRouteStatistics = (
  group: RouteGroup
): RouteStatistics => {
  // Calculate delays directly from timestamps
  const delays = group.examples.map((ex) => {
    const actualTime = ex.target.departureTime;
    const scheduledTime = ex.input.currDepTimeSched;
    const delay = (actualTime - scheduledTime) / (60 * 1000); // Convert to minutes

    // Debug: Log large delays and their components
    if (Math.abs(delay) > 1000) {
      log.info(
        `Large delay in route ${group.routeId}: delay=${delay} minutes, actualTime=${actualTime}, scheduledTime=${scheduledTime}`
      );
      log.info(
        `Route ${group.routeId} breakdown: actualTime=${new Date(actualTime).toISOString()}, scheduledTime=${new Date(scheduledTime).toISOString()}`
      );
    }

    return delay;
  });

  const averageDelay =
    delays.length > 0
      ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length
      : 0;

  const delayVariance =
    delays.length > 0
      ? delays.reduce((sum, delay) => sum + (delay - averageDelay) ** 2, 0) /
        delays.length
      : 0;

  let dataQuality: "excellent" | "good" | "poor";
  if (group.examples.length >= 50 && delayVariance < 100) {
    dataQuality = "excellent";
  } else if (group.examples.length >= 20 && delayVariance < 200) {
    dataQuality = "good";
  } else {
    dataQuality = "poor";
  }

  // Debug: Log the final average delay
  log.info(`Route ${group.routeId} final average delay: ${averageDelay}`);

  return {
    routeId: group.routeId,
    exampleCount: group.examples.length,
    hasValidData: group.examples.length > 0,
    averageDelay,
    dataQuality,
  };
};
