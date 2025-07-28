import type { PropsWithChildren } from "react";

import { MapStateProvider } from "./MapStateContext";
import { VesselLocationProvider } from "./VesselLocationContext";
import { WsdotTerminalsProvider } from "./WsdotTerminalsContext";

/**
 * Main data provider that wraps all data contexts
 */
export const DataProvider = ({ children }: PropsWithChildren) => (
  <WsdotTerminalsProvider>
    <VesselLocationProvider>
      <MapStateProvider>{children}</MapStateProvider>
    </VesselLocationProvider>
  </WsdotTerminalsProvider>
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
