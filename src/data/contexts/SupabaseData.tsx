import { createContext, type PropsWithChildren, useContext } from "react";

import { useVesselTrip } from "../sources/supabase/vesselTrips";

/**
 * Context value providing vessel trip data
 */
type SupabaseDataContextType = {
  vesselTrips: ReturnType<typeof useVesselTrip>;
};

/**
 * React context for sharing vessel trip data across the app
 */
const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(
  undefined
);

/**
 * Provider component that fetches vessel trip data
 */
export const SupabaseDataProvider = ({ children }: PropsWithChildren) => {
  const vesselTrips = useVesselTrip();

  return (
    <SupabaseDataContext.Provider
      value={{
        vesselTrips,
      }}
    >
      {children}
    </SupabaseDataContext.Provider>
  );
};

/**
 * Hook to access vessel trip data
 * Must be used within SupabaseDataProvider
 */
export const useSupabaseData = () => {
  const context = useContext(SupabaseDataContext);
  if (!context) {
    throw new Error("useSupabaseData must be used within SupabaseDataProvider");
  }
  return context;
};
