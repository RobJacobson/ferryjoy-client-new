import { createContext, type PropsWithChildren, useContext } from "react";

import { useVesselTrip } from "../supabase/hooks";
import { useVesselTripRealtime } from "../supabase/hooks/realtime";

/**
 * Context value providing Supabase vessel trip data with real-time updates
 */
type SupabaseVesselTripsContextType = {
  vesselTrips: ReturnType<typeof useVesselTrip>;
};

/**
 * React context for sharing Supabase vessel trip data across the app
 * Provides real-time updates via Supabase subscriptions
 */
const SupabaseVesselTripsContext = createContext<
  SupabaseVesselTripsContextType | undefined
>(undefined);

/**
 * Provider component that fetches vessel trip data from Supabase
 * and sets up real-time subscriptions for automatic updates
 */
export const SupabaseVesselTripsProvider = ({
  children,
}: PropsWithChildren) => {
  // Fetch data using React Query hooks
  const vesselTrips = useVesselTrip();

  // Set up real-time subscriptions
  useVesselTripRealtime();

  return (
    <SupabaseVesselTripsContext.Provider value={{ vesselTrips }}>
      {children}
    </SupabaseVesselTripsContext.Provider>
  );
};

/**
 * Hook to access Supabase vessel trip data with real-time updates
 * Must be used within SupabaseVesselTripsProvider
 */
export const useSupabaseVesselTrips = () => {
  const context = useContext(SupabaseVesselTripsContext);
  if (!context) {
    throw new Error(
      "useSupabaseVesselTrips must be used within SupabaseVesselTripsProvider"
    );
  }
  return context;
};
