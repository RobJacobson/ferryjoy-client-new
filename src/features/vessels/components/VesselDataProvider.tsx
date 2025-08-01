import type { PropsWithChildren } from "react";

import { VesselLocationProvider } from "@/data/contexts";

/**
 * Provider component that wraps vessel data context
 */
export const VesselDataProvider = ({ children }: PropsWithChildren) => {
  return <VesselLocationProvider>{children}</VesselLocationProvider>;
};
