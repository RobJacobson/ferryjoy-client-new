import { useRealtime } from "../simpleMonitoring";

/**
 * Real-time hook for vessel trip data
 */
export const useVesselTripRealtime = () => {
  useRealtime({
    tableName: "vessel_trip",
    queryKey: ["vessel_trip"],
    logRealtime: true,
  });
};
