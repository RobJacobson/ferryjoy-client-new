// URL templates for WSF Schedule API endpoints

/**
 * URL templates for schedule API endpoints
 */
export const SCHEDULE_URL_TEMPLATES = {
  // Infrastructure
  cacheFlushDate: "/cacheflushdate",

  // Routes
  routes: "/routes",
  routesByDate: "/routes/{TripDate}",
  routesByTerminals:
    "/routes/{TripDate}/{DepartingTerminalID}/{ArrivingTerminalID}",

  // Terminals
  terminals: "/terminals",
  terminalsByRoute: "/terminals/{RouteID}",

  // Vessels
  vessels: "/vessels",
  vesselsByRoute: "/vessels/{RouteID}",

  // Schedules
  schedule: "/schedule",
  scheduleByRoute: "/schedule/{RouteID}",
  scheduleByDate: "/schedule/{TripDate}",
  scheduleByRouteAndDate: "/schedule/{RouteID}/{TripDate}",
  scheduleByTerminals:
    "/schedule/{TripDate}/{DepartingTerminalID}/{ArrivingTerminalID}",

  // Time Adjustments
  timeAdjustments: "/timeadjustments",
  timeAdjustmentsByRoute: "/timeadjustments/{RouteID}",
  timeAdjustmentsByDate: "/timeadjustments/{TripDate}",
  timeAdjustmentsByRouteAndDate: "/timeadjustments/{RouteID}/{TripDate}",

  // Special
  activeSeasons: "/activeseasons",
  alerts: "/alerts",
  alertsByRoute: "/alerts/{RouteID}",
} as const;

/**
 * Type for URL template keys
 */
export type ScheduleUrlTemplateKey = keyof typeof SCHEDULE_URL_TEMPLATES;
