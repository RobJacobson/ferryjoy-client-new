// Import local fallback data
import fallbackTerminals from "@assets/wsdot/terminalLocationsFiltered.json";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import type { TerminalLocation, TerminalVerbose } from "ws-dottie";
import { useTerminalLocations, useTerminalVerbose } from "ws-dottie";

/**
 * Context value providing WSDOT terminal data.
 * Combines static location data with dynamic terminal details from API.
 */
type WsdotTerminalsContextType = {
  terminals: TerminalLocation[]; // Terminal location information from API
  terminalsVerbose: TerminalVerbose[]; // Dynamic terminal details from API
  isLoading: boolean; // Loading state for terminal details
  error: string | null; // Error message for terminal details
};

/**
 * React context for sharing WSDOT terminal data across the app.
 * Provides terminal location information and dynamic details from API.
 * Uses API data for terminal locations with fallback to static data.
 */
const WsdotTerminalsContext = createContext<
  WsdotTerminalsContextType | undefined
>(undefined);

/**
 * Provider component that wraps the app and makes terminal data available to any child component.
 * Combines API terminal location data with dynamic terminal details from API.
 */
export const WsdotTerminalsProvider = ({ children }: PropsWithChildren) => {
  // Terminal location data from API
  const {
    data: terminalLocations,
    isLoading: locationsLoading,
    error: locationsError,
  } = useTerminalLocations();

  // Dynamic terminal details from API
  const {
    data: terminalVerbose,
    isLoading: verboseLoading,
    error: verboseError,
  } = useTerminalVerbose();

  // Use API data if available, otherwise fall back to static data
  const terminals =
    terminalLocations || (fallbackTerminals as unknown as TerminalLocation[]);

  return (
    <WsdotTerminalsContext
      value={{
        terminals,
        terminalsVerbose: terminalVerbose || [],
        isLoading: locationsLoading || verboseLoading,
        error: locationsError?.message || verboseError?.message || null,
      }}
    >
      {children}
    </WsdotTerminalsContext>
  );
};

/**
 * Hook to use the WSDOT terminals context.
 * @returns The terminal data, loading state, and any error
 * @throws Error if used outside of WsdotTerminalsProvider
 */
export const useWsdotTerminals = (): WsdotTerminalsContextType => {
  const context = useContext(WsdotTerminalsContext);
  if (context === undefined) {
    throw new Error(
      "useWsdotTerminals must be used within a WsdotTerminalsProvider"
    );
  }
  return context;
};
