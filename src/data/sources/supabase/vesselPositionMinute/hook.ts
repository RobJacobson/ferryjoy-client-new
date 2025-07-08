// VesselPositionMinute React hook

import { useEffect, useState } from "react";

import log from "@/lib/logger";

import { supabase } from "../client";
import { fetchVesselPositionMinutes } from "./api";
import { toVesselPositionMinute } from "./converter";
import type { VesselPositionMinute, VesselPositionMinuteMap } from "./types";

/**
 * Hook for fetching and managing vessel position minute data with real-time updates
 *
 * Fetches vessel position minute data from 3 AM today (or yesterday if before 3 AM) and maintains
 * real-time subscription for live updates. Returns positions grouped by trip ID for easy lookup
 * and state management. Only includes positions with non-null trip_id.
 *
 * @returns {Object} Object containing:
 *   - vesselPositionMinutes: Map of positions grouped by trip ID
 *   - loading: Boolean indicating if initial data is being fetched
 *   - error: Error message if data fetching fails
 */
export const useVesselPositionMinute = () => {
  // State for vessel position minutes grouped by trip ID
  const [vesselPositionMinutes, setVesselPositionMinutes] =
    useState<VesselPositionMinuteMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check Supabase configuration
    if (!supabase) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }

    const startTime = getStartTime();
    log.info(
      `Fetching vessel position minutes from ${startTime.toISOString()}`
    );

    // Load initial data and set up real-time subscription
    loadInitialData(startTime, setVesselPositionMinutes, setError, setLoading);
    const channel = setupSubscription(startTime, setVesselPositionMinutes);

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase?.removeChannel(channel);
      }
    };
  }, []);

  return { vesselPositionMinutes, loading, error };
};

// Load initial vessel position minute data from Supabase
const loadInitialData = async (
  startTime: Date,
  setVesselPositionMinutes: (positions: VesselPositionMinuteMap) => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void
) => {
  try {
    const positions = await fetchVesselPositionMinutes(startTime);
    const positionsMap = createPositionsMap(positions);
    setVesselPositionMinutes(positionsMap);
    logDataSize(
      `Fetched ${positions.length} vessel position minutes`,
      positions
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    log.error("Error fetching vessel position minutes:", err);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

// Set up real-time subscription for vessel position minute changes
const setupSubscription = (
  startTime: Date,
  setVesselPositionMinutes: React.Dispatch<
    React.SetStateAction<VesselPositionMinuteMap>
  >
) => {
  if (!supabase) return null;

  const channel = supabase
    .channel("vessel_position_minute_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "vessel_location_minute",
        filter: `timestamp=gte.${startTime.toISOString()}`,
      },
      (payload) => {
        log.debug("Vessel position minute change:", payload);

        // Only process positions with non-null trip_id
        if (payload.new && (payload.new as any).trip_id !== null) {
          const position = toVesselPositionMinute(payload.new as any);
          logDataSize(
            `Received ${payload.eventType} vessel position minute update`,
            payload.new
          );
          setVesselPositionMinutes((prev) =>
            handlePositionChange(prev, position, payload.eventType)
          );
        }
      }
    )
    .subscribe();

  return channel;
};

// Log data size in KB for monitoring
const logDataSize = (label: string, data: unknown) => {
  const dataSizeKB = (JSON.stringify(data).length * 2) / 1024;
  log.info(`${label} (${dataSizeKB.toFixed(1)} KB)`);
};

// Get start time for data fetching (3 AM today, or yesterday if before 3 AM)
const getStartTime = (): Date => {
  const now = new Date();
  const today3AM = new Date(now);
  today3AM.setHours(3, 0, 0, 0);
  return now.getHours() < 3
    ? new Date(today3AM.setDate(today3AM.getDate() - 1))
    : today3AM;
};

// Add new position to trip map
const addPositionToMap = (
  map: VesselPositionMinuteMap,
  position: VesselPositionMinute
): VesselPositionMinuteMap => ({
  ...map,
  [position.tripID]: [...(map[position.tripID] || []), position],
});

// Update existing position in trip map
const updatePositionInMap = (
  map: VesselPositionMinuteMap,
  position: VesselPositionMinute
): VesselPositionMinuteMap => ({
  ...map,
  [position.tripID]:
    map[position.tripID]?.map((p) => (p.id === position.id ? position : p)) ||
    [],
});

// Handle position changes based on event type (INSERT or UPDATE)
const handlePositionChange = (
  map: VesselPositionMinuteMap,
  position: VesselPositionMinute,
  eventType: string
): VesselPositionMinuteMap =>
  eventType === "INSERT"
    ? addPositionToMap(map, position)
    : updatePositionInMap(map, position);

// Create vessel position minutes map from array of positions
const createPositionsMap = (
  positions: VesselPositionMinute[]
): VesselPositionMinuteMap =>
  positions.reduce(
    (map, position) => addPositionToMap(map, position),
    {} as VesselPositionMinuteMap
  );
