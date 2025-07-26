import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import type { VesselLocation } from "ws-dottie";
import { useVesselLocations } from "ws-dottie";

import log from "@/shared/lib/logger";

/**
 * Context value providing vessel location data from WSF API.
 * Contains raw vessel position and status information.
 */
type VesselLocationContextType = {
  vesselLocations: VesselLocation[]; // Raw vessel location data from WSF API
};

/**
 * React context for sharing vessel location data across the app.
 * Provides vessel tracking data from WSF API for map display and vessel monitoring.
 */
const VesselLocationContext = createContext<
  VesselLocationContextType | undefined
>(undefined);

/**
 * Provider component that fetches vessel location data from WSF API.
 * Updates in real-time via React Query to provide current vessel positions and status.
 */
export const VesselLocationProvider = ({ children }: PropsWithChildren) => {
  // const animatedVessels = useVesselAnimation();
  const { data: vesselLocations = [] } = useVesselLocations();
  log.info("VesselLocationProvider", vesselLocations);
  return (
    <VesselLocationContext.Provider value={{ vesselLocations }}>
      {children}
    </VesselLocationContext.Provider>
  );
};

/**
 * Hook to access vessel location data from WSF API.
 * Provides raw vessel locations for map display and vessel monitoring.
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
