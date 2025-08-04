import type { PropsWithChildren } from "react";

import { BottomSheetProvider } from "./BottomSheetContext";
import { MapStateProvider } from "./MapStateContext";

/**
 * UI provider that wraps presentation state contexts
 */
export const UIContextProvider = ({ children }: PropsWithChildren) => (
  <MapStateProvider>
    <BottomSheetProvider>{children}</BottomSheetProvider>
  </MapStateProvider>
);

// Re-export contexts
export {
  BottomSheetProvider,
  useBottomSheet,
} from "./BottomSheetContext";
export {
  MapStateProvider,
  useMapState,
} from "./MapStateContext";
