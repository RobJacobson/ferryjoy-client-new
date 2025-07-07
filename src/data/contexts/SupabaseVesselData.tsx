import { createContext, type PropsWithChildren, useContext } from "react";

import {
  useVesselLocationCurrent,
  useVesselLocationMinute,
  useVesselLocationSecond,
} from "../supabase/hooks";
import {
  useVesselLocationCurrentRealtime,
  useVesselLocationMinuteRealtime,
  useVesselLocationSecondRealtime,
} from "../supabase/hooks/realtime";

/**
 * Context value providing Supabase vessel location data with real-time updates
 */
type SupabaseVesselDataContextType = {
  vesselLocationCurrent: ReturnType<typeof useVesselLocationCurrent>;
  vesselLocationMinute: ReturnType<typeof useVesselLocationMinute>;
  vesselLocationSecond: ReturnType<typeof useVesselLocationSecond>;
};

/**
 * React context for sharing Supabase vessel location data across the app
 * Provides real-time updates via Supabase subscriptions
 */
const SupabaseVesselDataContext = createContext<
  SupabaseVesselDataContextType | undefined
>(undefined);

/**
 * Provider component that fetches vessel location data from Supabase
 * and sets up real-time subscriptions for automatic updates
 */
export const SupabaseVesselDataProvider = ({ children }: PropsWithChildren) => {
  // Fetch data using React Query hooks
  const vesselLocationCurrent = useVesselLocationCurrent();
  const vesselLocationMinute = useVesselLocationMinute();
  const vesselLocationSecond = useVesselLocationSecond();

  // Set up real-time subscriptions
  useVesselLocationCurrentRealtime();
  useVesselLocationMinuteRealtime();
  useVesselLocationSecondRealtime();

  return (
    <SupabaseVesselDataContext.Provider
      value={{
        vesselLocationCurrent,
        vesselLocationMinute,
        vesselLocationSecond,
      }}
    >
      {children}
    </SupabaseVesselDataContext.Provider>
  );
};

/**
 * Hook to access Supabase vessel location data with real-time updates
 * Must be used within SupabaseVesselDataProvider
 */
export const useSupabaseVesselData = () => {
  const context = useContext(SupabaseVesselDataContext);
  if (!context) {
    throw new Error(
      "useSupabaseVesselData must be used within SupabaseVesselDataProvider"
    );
  }
  return context;
};
