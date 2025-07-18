import { useEffect, useState } from "react";
import type { VesselLocation } from "wsdot-api-client";
import { useVesselLocations } from "wsdot-api-client/react";

/**
 * Hook that filters vessels to keep only the most recent data for each vessel based on timestamp.
 * If multiple vessels have the same VesselID but different timestamps, returns the one with the latest timestamp.
 * Returns empty array if no vessels are available.
 */
export const useCurrentVesselLocation = () => {
  const [currentVesselLocations, setCurrentVesselLocations] = useState<
    Record<number, VesselLocation>
  >({});

  const { data: vessels = [] } = useVesselLocations();

  useEffect(() => {
    setCurrentVesselLocations((prevLocations) => {
      return vessels.reduce(
        (acc, vessel) => updateVesselLocations(acc, vessel),
        { ...prevLocations }
      );
    });
  }, [vessels]);

  return Object.values(currentVesselLocations);
};

/**
 * Updates vessel locations with the latest timestamp data.
 * Merges new vessel data with existing data, keeping the most recent timestamp for each vessel.
 */
const updateVesselLocations = (
  prevLocations: Record<number, VesselLocation>,
  nextVessel: VesselLocation
): Record<number, VesselLocation> => {
  const prevVessel = prevLocations[nextVessel.VesselID];
  prevLocations[nextVessel.VesselID] = newestVesselLocation(
    prevVessel,
    nextVessel
  );
  return prevLocations;
};

/**
 * Determines which vessel location has the most recent timestamp.
 * Returns the newer vessel location, or the next vessel if no previous exists.
 */
const newestVesselLocation = (
  prev: VesselLocation | undefined,
  next: VesselLocation
): VesselLocation => {
  if (!prev) return next;
  return prev.TimeStamp && next.TimeStamp && prev.TimeStamp > next.TimeStamp
    ? prev
    : next;
};
