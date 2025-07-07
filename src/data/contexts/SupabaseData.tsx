import { createContext, type PropsWithChildren, useContext } from "react";

import log from "@/lib/logger";

import { useVesselLocationCurrent } from "../supabase/hooks/useVesselLocationCurrent";
import { useVesselLocationCurrentRealtime } from "../supabase/hooks/useVesselLocationCurrentRealtime";
import { useVesselLocationMinute } from "../supabase/hooks/useVesselLocationMinute";
import { useVesselLocationMinuteRealtime } from "../supabase/hooks/useVesselLocationMinuteRealtime";
import { useVesselLocationSecond } from "../supabase/hooks/useVesselLocationSecond";
import { useVesselLocationSecondRealtime } from "../supabase/hooks/useVesselLocationSecondRealtime";
import { useVesselTrip } from "../supabase/hooks/useVesselTrip";
import { useVesselTripRealtime } from "../supabase/hooks/useVesselTripRealtime";

/**
 * Context value providing all Supabase data with real-time updates
 */
type SupabaseDataContextType = {
  vesselLocationCurrent: ReturnType<typeof useVesselLocationCurrent>;
  vesselLocationMinute: ReturnType<typeof useVesselLocationMinute>;
  vesselLocationSecond: ReturnType<typeof useVesselLocationSecond>;
  vesselTrips: ReturnType<typeof useVesselTrip>;
};

/**
 * React context for sharing all Supabase data across the app
 * Provides real-time updates via Supabase subscriptions
 */
const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(
  undefined
);

/**
 * Provider component that fetches all Supabase data and sets up real-time subscriptions
 * This is a convenience provider that combines all Supabase data in one place
 */
export const SupabaseDataProvider = ({ children }: PropsWithChildren) => {
  log.debug("Initializing SupabaseDataProvider");

  // Fetch data using React Query hooks
  const vesselLocationCurrent = useVesselLocationCurrent();
  const vesselLocationMinute = useVesselLocationMinute();
  const vesselLocationSecond = useVesselLocationSecond();
  const vesselTrips = useVesselTrip();

  // Set up real-time subscriptions
  useVesselLocationCurrentRealtime();
  useVesselLocationMinuteRealtime();
  useVesselLocationSecondRealtime();
  useVesselTripRealtime();

  log.debug("SupabaseDataProvider initialized with data status:", {
    current: vesselLocationCurrent.status,
    minute: vesselLocationMinute.status,
    second: vesselLocationSecond.status,
    trips: vesselTrips.status,
  });

  return (
    <SupabaseDataContext.Provider
      value={{
        vesselLocationCurrent,
        vesselLocationMinute,
        vesselLocationSecond,
        vesselTrips,
      }}
    >
      {children}
    </SupabaseDataContext.Provider>
  );
};

/**
 * Hook to access all Supabase data with real-time updates
 * Must be used within SupabaseDataProvider
 */
export const useSupabaseData = () => {
  const context = useContext(SupabaseDataContext);
  if (!context) {
    log.error("useSupabaseData must be used within SupabaseDataProvider");
    throw new Error("useSupabaseData must be used within SupabaseDataProvider");
  }
  return context;
};
