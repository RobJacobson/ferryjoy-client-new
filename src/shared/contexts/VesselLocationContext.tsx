import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useVesselLocations, type VesselLocation } from "ws-dottie";

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
  const { data: vesselLocations = [] } = useVesselLocations();
  const lastVesselLocationsRef = useRef<VesselLocation[]>([]);

  useEffect(() => {
    // Only update if the vessel locations have actually changed
    const hasChanged =
      vesselLocations.length !== lastVesselLocationsRef.current.length ||
      vesselLocations.some((vessel, index) => {
        const lastVessel = lastVesselLocationsRef.current[index];
        return (
          !lastVessel ||
          vessel.VesselID !== lastVessel.VesselID ||
          vessel.TimeStamp !== lastVessel.TimeStamp
        );
      });

    if (hasChanged) {
      setCurrentVesselLocations((prevLocations) =>
        mergeVesselLocations(prevLocations, vesselLocations)
      );
      lastVesselLocationsRef.current = vesselLocations;
    }
  }, [vesselLocations]);

  return (
    <VesselLocationContext.Provider
      value={{
        vesselLocations: Object.values(currentVesselLocations),
      }}
    >
      {children}
    </VesselLocationContext.Provider>
  );
};

/**
 * Hook to access deduplicated vessel location data from WSF API.
 * Provides only the most recent data for each vessel for map display and vessel monitoring.
 * Must be used within VesselLocationProvider.
 */
export const useVesselLocation = () => {
  const context = useContext(VesselLocationContext);
  if (context === undefined || context === null) {
    // Return a safe default instead of throwing an error
    return { vesselLocations: [] };
  }
  return context;
};

/**
 * Merges current vessel locations with previous locations, keeping only the most recent data for each vessel.
 * Uses reduce to build a record where each key is a VesselID and each value is the most recent VesselLocation.
 */
const mergeVesselLocations = (
  prevLocations: VesselRecord,
  currentLocations: VesselLocation[]
) =>
  currentLocations.reduce((acc, vessel) => {
    acc[vessel.VesselID] = newestVesselLocation(
      prevLocations[vessel.VesselID],
      vessel
    );
    return acc;
  }, {} as VesselRecord);

/**
 * Determines which vessel location has the most recent timestamp.
 * Returns the newer vessel location, or the next vessel if no previous exists.
 */
const newestVesselLocation = (
  prev: VesselLocation | undefined,
  next: VesselLocation
): VesselLocation => (!prev || prev.TimeStamp < next.TimeStamp ? next : prev);
