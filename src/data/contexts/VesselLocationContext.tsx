import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import type { VesselLocation } from "ws-dottie";

import { useVesselAnimation } from "@/hooks/useVesselAnimation";

/**
 * Context value providing smoothed vessel data for animation.
 * Uses exponential smoothing to create fluid vessel movement on maps.
 */
type VesselLocationContextType = {
  animatedVessels: VesselLocation[]; // Vessels with exponentially smoothed position/motion data
};

/**
 * React context for sharing smoothed vessel position data across the app.
 * Provides vessel tracking data with position smoothing for better UX.
 */
const VesselLocationContext = createContext<
  VesselLocationContextType | undefined
>(undefined);

/**
 * Provider component that fetches vessel location data from WSF API and applies exponential smoothing
 * with position projection for fluid animations. Projects vessels 10 seconds into the future to reduce
 * perceived latency. Updates in real-time via React Query while smoothing position changes.
 */
export const VesselLocationProvider = ({ children }: PropsWithChildren) => {
  const animatedVessels = useVesselAnimation();

  return (
    <VesselLocationContext.Provider value={{ animatedVessels }}>
      {children}
    </VesselLocationContext.Provider>
  );
};

/**
 * Hook to access vessel position data for fluid map animations.
 * Provides vessel locations with exponential smoothing applied for better UX.
 * Must be used within VesselLocationProvider.
 */
export const useVesselLocation = () => {
  const context = useContext(VesselLocationContext);
  if (context === undefined || context === null) {
    // Return a safe default instead of throwing an error
    return { animatedVessels: [] };
  }
  return context;
};
