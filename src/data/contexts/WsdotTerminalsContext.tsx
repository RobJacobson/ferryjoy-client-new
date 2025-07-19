// Import local fallback data
import fallbackTerminals from "@assets/wsdot/terminalLocationsFiltered.json";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import type { TerminalVerbose } from "wsdot-api-client";
import { useTerminalVerbose } from "wsdot-api-client";

// Type for filtered terminal locations (without MapLink, Directions, DispGISZoomLoc)
type FilteredTerminalLocation = {
  TerminalID: number;
  TerminalSubjectID: number;
  RegionID: number;
  TerminalName: string;
  TerminalAbbrev: string;
  SortSeq: number;
  AddressLineOne: string;
  AddressLineTwo: string | null;
  City: string;
  State: string;
  ZipCode: string;
  Country: string;
  Latitude: number;
  Longitude: number;
};

/**
 * Context value providing WSDOT terminal data.
 * Combines static location data with dynamic terminal details from API.
 */
type WsdotTerminalsContextType = {
  terminals: FilteredTerminalLocation[]; // Static terminal location information
  terminalsVerbose: TerminalVerbose[]; // Dynamic terminal details from API
  isLoading: boolean; // Loading state for terminal details
  error: string | null; // Error message for terminal details
};

/**
 * React context for sharing WSDOT terminal data across the app.
 * Provides terminal location information and dynamic details from API.
 * Uses local static data for immediate availability of locations.
 */
const WsdotTerminalsContext = createContext<
  WsdotTerminalsContextType | undefined
>(undefined);

/**
 * Provider component that wraps the app and makes terminal data available to any child component.
 * Combines static location data with dynamic terminal details from API.
 */
export const WsdotTerminalsProvider = ({ children }: PropsWithChildren) => {
  // Static location data - immediately available
  const terminals = fallbackTerminals as unknown as FilteredTerminalLocation[];

  // Dynamic terminal details from API
  const { data: terminalVerbose, isLoading, error } = useTerminalVerbose();

  const value: WsdotTerminalsContextType = {
    terminals,
    terminalsVerbose: terminalVerbose || [],
    isLoading,
    error: error?.message || null,
  };

  return (
    <WsdotTerminalsContext.Provider value={value}>
      {children}
    </WsdotTerminalsContext.Provider>
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
