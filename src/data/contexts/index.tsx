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
  <WsdotTerminalsProvider>
    <VesselLocationProvider>
      <VesselPingProvider>
        <VesselTripProvider>{children}</VesselTripProvider>
      </VesselPingProvider>
    </VesselLocationProvider>
  </WsdotTerminalsProvider>
);
