import { createContext, useContext } from 'react';

import { useVesselLocationMinute, useVesselLocationSecond, useVesselTrip } from '../supabase/hooks';
import { useVesselLocationMinuteRealtime, useVesselLocationSecondRealtime, useVesselTripRealtime } from '../supabase/hooks/realtime';

/**
 * Context value providing all Supabase data with real-time updates
 */
type SupabaseDataContextType = {
  vesselLocationMinute: ReturnType<typeof useVesselLocationMinute>;
  vesselLocationSecond: ReturnType<typeof useVesselLocationSecond>;
  vesselTrips: ReturnType<typeof useVesselTrip>;
};

/**
 * React context for sharing all Supabase data across the app
 * Provides real-time updates via Supabase subscriptions
 */
const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined);

/**
 * Provider component that fetches all Supabase data and sets up real-time subscriptions
 * This is a convenience provider that combines all Supabase data in one place
 */
export const SupabaseDataProvider = ({ children }: { children: React.ReactNode }) => {
  // Fetch data using React Query hooks
  const vesselLocationMinute = useVesselLocationMinute();
  const vesselLocationSecond = useVesselLocationSecond();
  const vesselTrips = useVesselTrip();

  // Set up real-time subscriptions
  useVesselLocationMinuteRealtime();
  useVesselLocationSecondRealtime();
  useVesselTripRealtime();

  return (
    <SupabaseDataContext.Provider value={{ vesselLocationMinute, vesselLocationSecond, vesselTrips }}>
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
    throw new Error('useSupabaseData must be used within SupabaseDataProvider');
  }
  return context;
}; 