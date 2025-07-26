import type { PropsWithChildren } from "react";

import { MapStateProvider } from "./MapStateContext";
import { SupabaseDataProvider } from "./SupabaseData";
import { VesselLocationProvider } from "./VesselLocationContext";
import { WsdotTerminalsProvider } from "./WsdotTerminalsContext";

/**
 * Main data provider that wraps all data contexts
 */
export const DataProvider = ({ children }: PropsWithChildren) => (
  <SupabaseDataProvider>
    <WsdotTerminalsProvider>
      <VesselLocationProvider>
        <MapStateProvider>{children}</MapStateProvider>
      </VesselLocationProvider>
    </WsdotTerminalsProvider>
  </SupabaseDataProvider>
);

export {
  MapStateProvider,
  useMapState,
} from "./MapStateContext";
export {
  useVesselLocation,
  VesselLocationProvider,
} from "./VesselLocationContext";
export {
  useWsdotTerminals,
  WsdotTerminalsProvider,
} from "./WsdotTerminalsContext";
