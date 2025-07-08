// Types for routes

export type { Route, RouteParams } from "../shared/types";

/**
 * Raw API response type for route
 */
export type WsfRouteResponse = {
  RouteID: number;
  RouteName: string;
  RouteDescription: string;
  RouteAbbreviation: string;
  RouteColor: string;
  IsActive: boolean;
  Terminals: WsfRouteTerminalResponse[];
};

/**
 * Raw API response type for terminal within a route
 */
export type WsfRouteTerminalResponse = {
  TerminalID: number;
  TerminalName: string;
  TerminalAbbreviation: string;
  Latitude: number;
  Longitude: number;
  IsActive: boolean;
};

/**
 * Raw API response type for route details
 */
export type WsfRouteDetailsResponse = {
  RouteID: number;
  RouteName: string;
  RouteDescription: string;
  RouteAbbreviation: string;
  RouteColor: string;
  IsActive: boolean;
  Terminals: WsfRouteTerminalResponse[];
  // Additional detailed fields would go here
};

/**
 * Raw API response type for scheduled route
 */
export type WsfScheduledRouteResponse = {
  SchedRouteID: number;
  RouteID: number;
  RouteName: string;
  RouteDescription: string;
  RouteAbbreviation: string;
  RouteColor: string;
  IsActive: boolean;
  SeasonID: number;
  SeasonName: string;
  Terminals: WsfRouteTerminalResponse[];
};

/**
 * Raw API response type for active season
 */
export type WsfActiveSeasonResponse = {
  SeasonID: number;
  SeasonName: string;
  StartDate: string;
  EndDate: string;
  IsActive: boolean;
};

/**
 * Raw API response type for alert
 */
export type WsfAlertResponse = {
  AlertID: number;
  AlertType: string;
  AlertMessage: string;
  StartDate: string;
  EndDate: string;
  IsActive: boolean;
  AffectedRoutes: number[];
};
