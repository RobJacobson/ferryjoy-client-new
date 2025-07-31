import type { PropsWithChildren } from "react";

// Import data contexts
import {
  TripDataProvider,
  VesselLocationProvider,
  VesselPingProvider,
  WsdotTerminalsProvider,
} from "@/data/contexts";

// Import UI contexts
import { MapStateProvider } from "./ui";

/**
 * Main provider that wraps all contexts (UI and data)
 * Organized with data contexts on the outside, UI contexts on the inside
 */
export const DataProvider = ({ children }: PropsWithChildren) => (
  <WsdotTerminalsProvider>
    <VesselLocationProvider>
      <VesselPingProvider>
        <TripDataProvider>
          <MapStateProvider>{children}</MapStateProvider>
        </TripDataProvider>
      </VesselPingProvider>
    </VesselLocationProvider>
  </WsdotTerminalsProvider>
);

// Data Contexts
export {
  TripDataProvider,
  useTripData,
  useVesselLocation,
  useVesselPings,
  useWsdotTerminals,
  VesselLocationProvider,
  VesselPingProvider,
  WsdotTerminalsProvider,
} from "@/data/contexts";

// Re-export all contexts for easy access
// UI Contexts
export { MapStateProvider, useMapState } from "./ui";
