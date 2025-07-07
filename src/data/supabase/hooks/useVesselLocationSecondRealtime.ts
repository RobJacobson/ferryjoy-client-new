import { useRealtime } from "../simpleMonitoring";

/**
 * Real-time hook for vessel location second data
 */
export const useVesselLocationSecondRealtime = () => {
  useRealtime({
    tableName: "vessel_location_second",
    queryKey: ["vessel_location_second"],
    logRealtime: true,
  });
};
