import { useEffect, useState } from "react";

import type { VesselTrip } from "@/data/shared/VesselTrip";
import { supabase } from "@/data/supabase/client";
import log from "@/lib/logger";

import type { Tables } from "../database.types";

type VesselTripRow = Tables<"vessel_trip">;
type VesselTripMap = Record<string, VesselTrip[]>; // Grouped by vessel abbreviation

// Transform database row to VesselTrip object
const toVesselTrip = (row: VesselTripRow): VesselTrip => ({
  id: row.id,
  vesselID: row.vessel_id ?? 0,
  vesselName: row.vessel_name ?? "",
  vesselAbrv: row.vessel_abrv ?? "",
  depTermID: row.dep_term_id ?? 0,
  depTermAbrv: row.dep_term_abrv ?? "",
  arvTermID: row.arv_term_id,
  arvTermAbrv: row.arv_term_abrv,
  inService: row.in_service ?? false,
  eta: row.eta ? new Date(row.eta) : null,
  schedDep: row.sched_dep ? new Date(row.sched_dep) : null,
  opRouteAbrv: row.op_route_abrv ?? "",
  vesselPosNum: row.vessel_pos_num,
  sortSeq: 0,
  timeStart: row.start_at ? new Date(row.start_at) : null,
  timeLeftDock: row.left_dock ? new Date(row.left_dock) : null,
  timeArrived: row.end_at ? new Date(row.end_at) : null,
  timeUpdated: row.updated_at ? new Date(row.updated_at) : null,
  vesselPositions: [],
});

/**
 * Hook for fetching and managing vessel trip data with real-time updates
 *
 * Fetches vessel trips from 3 AM today (or yesterday if before 3 AM) and maintains
 * real-time subscription for live updates. Returns trips grouped by vessel abbreviation
 * for easy lookup and state management.
 *
 * @returns {Object} Object containing:
 *   - vesselTrips: Map of trips grouped by vessel abbreviation
 *   - loading: Boolean indicating if initial data is being fetched
 *   - error: Error message if data fetching fails
 */
export const useVesselTrip = () => {
  // State for vessel trips grouped by vessel abbreviation
  const [vesselTrips, setVesselTrips] = useState<VesselTripMap>({});
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
    log.info(`Fetching vessel trips from ${startTime.toISOString()}`);

    // Load initial data and set up real-time subscription
    loadInitialData(startTime, setVesselTrips, setError, setLoading);
    const channel = setupSubscription(startTime, setVesselTrips);

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase?.removeChannel(channel);
      }
    };
  }, []);

  return { vesselTrips, loading, error };
};

// Load initial vessel trip data from Supabase
const loadInitialData = async (
  startTime: Date,
  setVesselTrips: (trips: VesselTripMap) => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void
) => {
  try {
    const trips = await fetchTrips(startTime);
    const tripsMap = createTripsMap(trips);
    setVesselTrips(tripsMap);
    logDataSize(`Fetched ${trips.length} vessel trips`, trips);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    log.error("Error fetching vessel trips:", err);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

// Set up real-time subscription for vessel trip changes
const setupSubscription = (
  startTime: Date,
  setVesselTrips: React.Dispatch<React.SetStateAction<VesselTripMap>>
) => {
  if (!supabase) return null;

  const channel = supabase
    .channel("vessel_trip_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "vessel_trip",
        filter: `start_at=gte.${startTime.toISOString()}`,
      },
      (payload) => {
        log.debug("Vessel trip change:", payload);
        const trip = toVesselTrip(payload.new as VesselTripRow);
        logDataSize(
          `Received ${payload.eventType} vessel trip update`,
          payload.new
        );
        setVesselTrips((prev) =>
          handleTripChange(prev, trip, payload.eventType)
        );
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

// Add new trip to vessel map
const addTripToMap = (map: VesselTripMap, trip: VesselTrip): VesselTripMap => ({
  ...map,
  [trip.vesselAbrv]: [...(map[trip.vesselAbrv] || []), trip],
});

// Update existing trip in vessel map
const updateTripInMap = (
  map: VesselTripMap,
  trip: VesselTrip
): VesselTripMap => ({
  ...map,
  [trip.vesselAbrv]:
    map[trip.vesselAbrv]?.map((t) => (t.id === trip.id ? trip : t)) || [],
});

// Handle trip changes based on event type (INSERT or UPDATE)
const handleTripChange = (
  map: VesselTripMap,
  trip: VesselTrip,
  eventType: string
): VesselTripMap =>
  eventType === "INSERT" ? addTripToMap(map, trip) : updateTripInMap(map, trip);

// Fetch vessel trips from Supabase starting from given time
const fetchTrips = async (startTime: Date): Promise<VesselTrip[]> => {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("vessel_trip")
    .select("*")
    .gte("start_at", startTime.toISOString())
    .order("start_at", { ascending: true });

  if (error) throw error;
  return data?.map(toVesselTrip) ?? [];
};

// Create vessel trips map from array of trips
const createTripsMap = (trips: VesselTrip[]): VesselTripMap =>
  trips.reduce((map, trip) => addTripToMap(map, trip), {} as VesselTripMap);
