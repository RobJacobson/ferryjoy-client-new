import type { VesselLocation } from "ws-dottie";

/**
 * Filtered vessel location type without EtaBasis, SortSeq, or Mmsi fields
 */
export type VesselLocationFiltered = Omit<
  VesselLocation,
  "EtaBasis" | "SortSeq" | "ManagedBy" | "Mmsi"
>;

/**
 * Converts a VesselLocation object to a VesselLocationFiltered object
 * by removing EtaBasis, SortSeq, ManagedBy, and Mmsi fields
 */
export const toVesselLocationFiltered = (
  vl: VesselLocation
): VesselLocationFiltered => {
  const { EtaBasis, SortSeq, ManagedBy, Mmsi, ...filtered } = vl;
  return filtered;
};
