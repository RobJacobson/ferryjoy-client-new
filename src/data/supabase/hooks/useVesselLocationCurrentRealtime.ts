import { useRealtime } from "../simpleMonitoring";

/**
 * Real-time hook for vessel location current data
 */
export const useVesselLocationCurrentRealtime = () => {
  useRealtime({
    tableName: "vessel_location_current",
    queryKey: ["vessel_location_current"],
    logRealtime: true,
  });
};
