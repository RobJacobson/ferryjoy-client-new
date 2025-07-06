import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "../client";

/**
 * Real-time subscription hook for vessel_trip table
 * Automatically invalidates React Query cache when data changes
 */
export const useVesselTripRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("vessel_trip_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vessel_trip",
        },
        (_payload) => {
          // Invalidate and refetch the query when data changes
          queryClient.invalidateQueries({
            queryKey: ["supabase", "vessel_trip"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
