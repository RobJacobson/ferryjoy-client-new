import { createContext, type PropsWithChildren, useContext } from "react";

import { useVesselPositionMinute } from "../sources/supabase/vesselPositionMinute";
import { useVesselTrip } from "../sources/supabase/vesselTrips";

/**
 * Context value providing vessel trip and position data
 */
type SupabaseDataContextType = {
  vesselTrips: ReturnType<typeof useVesselTrip>;
  vesselPositionMinutes: ReturnType<typeof useVesselPositionMinute>;
};

/**
 * React context for sharing vessel trip and position data across the app
 */
const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(
  undefined
);

/**
 * Provider component that fetches vessel trip and position data
 */
export const SupabaseDataProvider = ({ children }: PropsWithChildren) => {
  const vesselTrips = useVesselTrip();
  const vesselPositionMinutes = useVesselPositionMinute();

  return (
    <SupabaseDataContext.Provider
      value={{
        vesselTrips,
        vesselPositionMinutes,
      }}
    >
      {children}
    </SupabaseDataContext.Provider>
  );
};

/**
 * Hook to access vessel trip and position data
 * Must be used within SupabaseDataProvider
 */
export const useSupabaseData = () => {
  const context = useContext(SupabaseDataContext);
  if (!context) {
    throw new Error("useSupabaseData must be used within SupabaseDataProvider");
  }
  return context;
};
