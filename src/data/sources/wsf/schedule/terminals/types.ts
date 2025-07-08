// Types for terminals

export type { Terminal } from "../shared/types";

/**
 * Raw API response type for terminal
 */
export type WsfTerminalResponse = {
  TerminalID: number;
  TerminalName: string;
  TerminalAbbreviation: string;
  Latitude: number;
  Longitude: number;
  IsActive: boolean;
};

/**
 * Raw API response type for terminal and mates
 */
export type WsfTerminalAndMatesResponse = {
  DepartingTerminal: WsfTerminalResponse;
  ArrivingTerminals: WsfTerminalResponse[];
};

/**
 * Raw API response type for terminal mates
 */
export type WsfTerminalMatesResponse = {
  TerminalID: number;
  TerminalName: string;
  TerminalAbbreviation: string;
  Latitude: number;
  Longitude: number;
  IsActive: boolean;
};
