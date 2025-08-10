import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import React, { type PropsWithChildren } from "react";

import {
  useVesselLocations,
  VesselLocationProvider,
} from "./VesselLocationContext";
import { useVesselPings, VesselPingProvider } from "./VesselPingContext";
import { useTripData, VesselTripProvider } from "./VesselTripContext";
import {
  useWsdotTerminals,
  WsdotTerminalsProvider,
} from "./WsdotTerminalsContext";

// Data Contexts - API data and business logic
export {
  useTripData,
  VesselTripProvider,
  useVesselLocations,
  VesselLocationProvider,
  useVesselPings,
  VesselPingProvider,
  useWsdotTerminals,
  WsdotTerminalsProvider,
};

/**
 * Provider that wraps all data contexts (API data and business logic)
 * Organized with external data on the outside, internal data on the inside
 */
export const DataContextProvider = ({ children }: PropsWithChildren) => (
  <ConvexProvider client={convexClient}>
    <QueryClientProvider client={queryClient}>
      <WsdotTerminalsProvider>
        <VesselLocationProvider>
          <VesselPingProvider>
            <VesselTripProvider>{children}</VesselTripProvider>
          </VesselPingProvider>
        </VesselLocationProvider>
      </WsdotTerminalsProvider>
    </QueryClientProvider>
  </ConvexProvider>
);

// Singleton clients for Convex and React Query
const queryClient = new QueryClient();

const convexUrl =
  process.env.EXPO_PUBLIC_CONVEX_URL ||
  "https://your-deployment-url.convex.cloud";

const convexClient = new ConvexReactClient(convexUrl);
