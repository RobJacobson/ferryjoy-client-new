import React, { type PropsWithChildren } from "react";

import {
  useVesselLocations,
  VesselLocationProvider,
} from "./VesselLocationContext";
import { useVesselPings, VesselPingProvider } from "./VesselPingContext";
import {
  VesselTripProvider as TripDataProvider,
  useTripData,
} from "./VesselTripContext";
import {
  useWsdotTerminals,
  WsdotTerminalsProvider,
} from "./WsdotTerminalsContext";

// Data Contexts - API data and business logic
export {
  useTripData,
  TripDataProvider,
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
        <TripDataProvider>{children}</TripDataProvider>
      </VesselPingProvider>
    </VesselLocationProvider>
  </WsdotTerminalsProvider>
);
