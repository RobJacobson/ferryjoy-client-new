import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "../client";

/**
 * Real-time subscription hook for vessel_location_second table
 * Automatically invalidates React Query cache when data changes
 */
export const useVesselLocationSecondRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("vessel_location_second_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vessel_location_second",
        },
        (_payload) => {
          // Invalidate and refetch the query when data changes
          queryClient.invalidateQueries({
            queryKey: ["supabase", "vessel_location_second"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
