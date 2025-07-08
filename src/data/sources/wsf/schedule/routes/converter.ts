// Converter functions for routes

import type { Route } from "../shared/types";
import type {
  WsfActiveSeasonResponse,
  WsfAlertResponse,
  WsfRouteDetailsResponse,
  WsfRouteResponse,
  WsfRouteTerminalResponse,
  WsfScheduledRouteResponse,
} from "./types";

/**
 * Converts WSF API route response to domain model
 */
export const toRoute = (data: WsfRouteResponse): Route => ({
  id: data.RouteID,
  name: data.RouteName,
  description: data.RouteDescription,
  abbreviation: data.RouteAbbreviation,
  color: data.RouteColor,
  isActive: data.IsActive,
  terminals: data.Terminals.map(toRouteTerminal),
});

/**
 * Converts WSF API terminal response to domain model
 */
export const toRouteTerminal = (data: WsfRouteTerminalResponse) => ({
  id: data.TerminalID,
  name: data.TerminalName,
  abbreviation: data.TerminalAbbreviation,
  latitude: data.Latitude,
  longitude: data.Longitude,
  isActive: data.IsActive,
});

/**
 * Converts WSF API route details response to domain model
 */
export const toRouteDetails = (data: WsfRouteDetailsResponse): Route => ({
  id: data.RouteID,
  name: data.RouteName,
  description: data.RouteDescription,
  abbreviation: data.RouteAbbreviation,
  color: data.RouteColor,
  isActive: data.IsActive,
  terminals: data.Terminals.map(toRouteTerminal),
});

/**
 * Converts WSF API scheduled route response to domain model
 */
export const toScheduledRoute = (data: WsfScheduledRouteResponse) => ({
  schedRouteId: data.SchedRouteID,
  routeId: data.RouteID,
  name: data.RouteName,
  description: data.RouteDescription,
  abbreviation: data.RouteAbbreviation,
  color: data.RouteColor,
  isActive: data.IsActive,
  seasonId: data.SeasonID,
  seasonName: data.SeasonName,
  terminals: data.Terminals.map(toRouteTerminal),
});

/**
 * Converts WSF API active season response to domain model
 */
export const toActiveSeason = (data: WsfActiveSeasonResponse) => ({
  seasonId: data.SeasonID,
  seasonName: data.SeasonName,
  startDate: new Date(data.StartDate),
  endDate: new Date(data.EndDate),
  isActive: data.IsActive,
});

/**
 * Converts WSF API alert response to domain model
 */
export const toAlert = (data: WsfAlertResponse) => ({
  alertId: data.AlertID,
  alertType: data.AlertType,
  alertMessage: data.AlertMessage,
  startDate: new Date(data.StartDate),
  endDate: new Date(data.EndDate),
  isActive: data.IsActive,
  affectedRoutes: data.AffectedRoutes,
});
