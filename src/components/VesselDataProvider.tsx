import type { PropsWithChildren } from "react";
import * as React from "react";

import { VesselPositionsProvider } from "@/data/contexts/VesselPositionsContext";

/**
 * Wrapper component for vessel data that ensures proper context isolation
 */
export const VesselDataProvider = ({ children }: PropsWithChildren) => {
  return <VesselPositionsProvider>{children}</VesselPositionsProvider>;
};
