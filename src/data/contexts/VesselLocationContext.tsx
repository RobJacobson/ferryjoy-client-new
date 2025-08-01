import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  useVesselLocations as useVesselLocationsApi,
  type VesselLocation,
} from "ws-dottie";

type VesselRecord = Record<number, VesselLocation>;

/**
 * Context value providing deduplicated vessel location data from WSF API.
 * Contains only the most recent data for each vessel based on timestamp.
 */
type VesselLocationContextType = {
  vesselLocations: VesselLocation[]; // Deduplicated current vessel data
};

/**
 * React context for sharing vessel location data across the app.
 * Provides deduplicated vessel tracking data from WSF API for map display and vessel monitoring.
 */
const VesselLocationContext = createContext<
  VesselLocationContextType | undefined
>(undefined);

/**
 * Provider component that fetches vessel location data from WSF API.
 * Updates in real-time via React Query to provide current vessel positions and status.
 * Handles deduplication to ensure only the most recent data for each vessel is available.
 */
export const VesselLocationProvider = ({ children }: PropsWithChildren) => {
  const [currentVesselLocations, setCurrentVesselLocations] =
    useState<VesselRecord>({});
  const { data: vesselLocations = [] } = useVesselLocationsApi();

  useEffect(() => {
    if (vesselLocations.length === 0) return;

    setCurrentVesselLocations((prevLocations) =>
      updateVesselLocationsIfChanged(prevLocations, vesselLocations)
    );
  }, [vesselLocations]);

  const contextValue = {
    vesselLocations: Object.values(currentVesselLocations),
  };

  return (
    <VesselLocationContext value={contextValue}>
      {children}
    </VesselLocationContext>
  );
};

/**
 * Hook to access deduplicated vessel location data from WSF API.
 * Provides only the most recent data for each vessel for map display and vessel monitoring.
 * Must be used within VesselLocationProvider.
 */
export const useVesselLocations = () => {
  const context = useContext(VesselLocationContext);
  if (context === undefined || context === null) {
    // Return a safe default instead of throwing an error
    return { vesselLocations: [] };
  }
  return context;
};

/**
 * Updates vessel locations only if the data has actually changed to prevent unnecessary re-renders.
 * Returns the previous locations if no changes are detected, otherwise returns the merged locations.
 */
const updateVesselLocationsIfChanged = (
  prevLocations: VesselRecord,
  vesselLocations: VesselLocation[]
): VesselRecord => {
  const newLocations = mergeVesselLocations(prevLocations, vesselLocations);

  // If the number of vessels changed, we definitely have changes
  if (Object.keys(newLocations).length !== Object.keys(prevLocations).length) {
    return newLocations;
  }

  // Check if any vessel has a newer timestamp
  const hasChanges = Object.keys(newLocations).some(
    (vesselId) =>
      newLocations[Number(vesselId)]?.TimeStamp !==
      prevLocations[Number(vesselId)]?.TimeStamp
  );

  return hasChanges ? newLocations : prevLocations;
};

/**
 * Merges current vessel locations with previous locations, keeping only the most recent data for each vessel.
 * Builds upon previous locations and only updates vessels that have newer data.
 */
const mergeVesselLocations = (
  prevLocations: VesselRecord,
  currentLocations: VesselLocation[]
) => {
  const result = { ...prevLocations };

  for (const vessel of currentLocations) {
    const existing = result[vessel.VesselID];
    if (!existing || existing.TimeStamp < vessel.TimeStamp) {
      result[vessel.VesselID] = vessel;
    }
  }

  return result;
};
