import { useRealtime } from "../simpleMonitoring";

/**
 * Real-time hook for vessel location minute data
 */
export const useVesselLocationMinuteRealtime = () => {
  useRealtime({
    tableName: "vessel_location_minute",
    queryKey: ["vessel_location_minute"],
    logRealtime: true,
  });
};
