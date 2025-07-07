import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import log from "@/lib/logger";

import { isSupabaseConfigured, supabase } from "../client";

/**
 * Real-time subscription hook for vessel_location_current table
 * Automatically invalidates React Query cache when data changes
 */
export const useVesselLocationCurrentRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      log.debug(
        "Skipping vessel location current realtime subscription - Supabase not configured"
      );
      return;
    }

    log.debug("Setting up vessel location current realtime subscription");

    const channel = supabase
      .channel("vessel_location_current_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vessel_location_current",
        },
        (payload) => {
          log.debug(
            "Vessel location current realtime event received:",
            payload.eventType
          );
          // Invalidate and refetch the query when data changes
          queryClient.invalidateQueries({
            queryKey: ["supabase", "vessel_location_current"],
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          log.info("Vessel location current realtime subscription active");
        } else if (status === "CHANNEL_ERROR") {
          log.error("Vessel location current realtime subscription error");
        } else if (status === "TIMED_OUT") {
          log.warn("Vessel location current realtime subscription timed out");
        }
      });

    return () => {
      if (supabase) {
        log.debug("Cleaning up vessel location current realtime subscription");
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);
};
