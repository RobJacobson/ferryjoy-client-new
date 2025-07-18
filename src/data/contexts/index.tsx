import type { PropsWithChildren } from "react";

import { MapStateProvider } from "./MapStateContext";
import { SupabaseDataProvider } from "./SupabaseData";
import { VesselPositionsProvider } from "./VesselPositionsContext";

// Define the composition directly in the index
export const DataProvider = ({ children }: PropsWithChildren) => (
  <SupabaseDataProvider>
    <VesselPositionsProvider>
      <MapStateProvider>{children}</MapStateProvider>
    </VesselPositionsProvider>
  </SupabaseDataProvider>
);

// Export individual providers too
export { MapStateProvider, useMapState } from "./MapStateContext";
export { SupabaseDataProvider, useSupabaseData } from "./SupabaseData";
export {
  useVesselPositions,
  VesselPositionsProvider,
} from "./VesselPositionsContext";
