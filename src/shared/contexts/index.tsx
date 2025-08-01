import type { PropsWithChildren } from "react";

import { MapStateProvider } from "./ui";

/**
 * UI provider that wraps presentation state contexts
 */
export const UIContextProvider = ({ children }: PropsWithChildren) => (
  <MapStateProvider>{children}</MapStateProvider>
);

// Re-export local UI contexts
export {
  MapStateProvider,
  useMapState,
} from "./ui";
