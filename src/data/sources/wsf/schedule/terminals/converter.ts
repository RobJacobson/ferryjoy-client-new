// Converter functions for terminals

import type { Terminal } from "../shared/types";
import type {
  WsfTerminalAndMatesResponse,
  WsfTerminalMatesResponse,
  WsfTerminalResponse,
} from "./types";

/**
 * Converts WSF API terminal response to domain model
 */
export const toTerminal = (data: WsfTerminalResponse): Terminal => ({
  id: data.TerminalID,
  name: data.TerminalName,
  abbreviation: data.TerminalAbbreviation,
  latitude: data.Latitude,
  longitude: data.Longitude,
  isActive: data.IsActive,
});

/**
 * Converts WSF API terminal and mates response to domain model
 */
export const toTerminalAndMates = (data: WsfTerminalAndMatesResponse) => ({
  departingTerminal: toTerminal(data.DepartingTerminal),
  arrivingTerminals: data.ArrivingTerminals.map(toTerminal),
});

/**
 * Converts WSF API terminal mates response to domain model
 */
export const toTerminalMates = (data: WsfTerminalMatesResponse): Terminal => ({
  id: data.TerminalID,
  name: data.TerminalName,
  abbreviation: data.TerminalAbbreviation,
  latitude: data.Latitude,
  longitude: data.Longitude,
  isActive: data.IsActive,
});
