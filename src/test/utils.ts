import { vi } from "vitest";

import type {
  ActiveSeason,
  Alert,
  Route,
  Schedule,
} from "@/data/wsf/schedule/types";
import type {
  TerminalSailingSpace,
  TerminalVerbose,
} from "@/data/wsf/terminals/types";
import type { VesselLocation, VesselVerbose } from "@/data/wsf/vessels/types";

// Mock WSF API responses
export const mockVesselLocationResponse: VesselLocation[] = [
  {
    vesselID: 1,
    vesselName: "M/V Cathlamet",
    longitude: -122.3321,
    latitude: 47.6062,
    heading: 180,
    speed: 12.5,
    inService: true,
    atDock: false,
    departingTerminalId: 1,
    departingTerminalName: "Seattle",
    arrivingTerminalId: 2,
    arrivingTerminalName: "Bainbridge Island",
    scheduledDeparture: new Date("2023-12-21T14:30:00.000Z"),
    estimatedArrival: new Date("2023-12-21T15:00:00.000Z"),
    lastUpdated: new Date("2023-12-21T14:30:00.000Z"),
  },
  {
    vesselID: 2,
    vesselName: "M/V Walla Walla",
    longitude: -122.3493,
    latitude: 47.6205,
    heading: 90,
    speed: 8.2,
    inService: true,
    atDock: false,
    departingTerminalId: 3,
    departingTerminalName: "Edmonds",
    arrivingTerminalId: 4,
    arrivingTerminalName: "Kingston",
    scheduledDeparture: new Date("2023-12-21T14:45:00.000Z"),
    estimatedArrival: new Date("2023-12-21T15:15:00.000Z"),
    lastUpdated: new Date("2023-12-21T14:30:00.000Z"),
  },
];

export const mockVesselVerboseResponse: VesselVerbose[] = [
  {
    vesselId: 1,
    vesselName: "M/V Cathlamet",
    abbrev: "CATH",
    vesselClass: "Jumbo Mark II",
    inService: true,
    active: true,
    yearBuilt: 1980,
    displacement: 5000,
    length: 460,
    breadth: 89,
    draft: 18.5,
    carCapacity: 218,
    passengerCapacity: 2500,
    maxPassengers: 2500,
    maxVehicles: 218,
    maxGrossTonnage: 5000,
    horsepower: 12000,
    maxSpeed: 18,
    homeTerminalId: 1,
    homeTerminalName: "Seattle",
    accommodations: [],
    stats: [],
    location: mockVesselLocationResponse[0],
  },
];

export const mockTerminalSailingSpaceResponse: TerminalSailingSpace[] = [
  {
    terminalId: 1,
    terminalName: "Seattle",
    sailingId: 1,
    departureTime: new Date("2023-12-21T14:30:00.000Z"),
    driveUpSpaces: 100,
    reservationSpaces: 50,
    totalSpaces: 150,
    isActive: true,
  },
];

export const mockTerminalVerboseResponse: TerminalVerbose[] = [
  {
    terminalId: 1,
    terminalName: "Seattle",
    terminalAbbrev: "SEA",
    latitude: 47.6062,
    longitude: -122.3321,
    address: "801 Alaskan Way, Seattle, WA 98104",
    city: "Seattle",
    state: "WA",
    zipCode: "98104",
    county: "King",
    phone: "(206) 464-6400",
    hasWaitTime: true,
    hasSpaceAvailable: true,
    gisZoomLocation: {
      latitude: 47.6062,
      longitude: -122.3321,
      zoomLevel: 15,
    },
    transitLinks: [],
    waitTimes: [],
    bulletins: [],
    sailingSpaces: [],
    isActive: true,
  },
];

export const mockRouteResponse: Route[] = [
  {
    routeId: 1,
    routeName: "Seattle - Bainbridge Island",
    routeAbbrev: "SEA-BAI",
    routeDescription: "Seattle to Bainbridge Island ferry route",
    routeColor: "#0066CC",
    sortSeq: 1,
    crossingTime: 35,
    distance: 8.6,
    isActive: true,
    serviceRoutes: [],
  },
];

export const mockScheduleResponse: Schedule[] = [
  {
    routeId: 1,
    routeName: "Seattle - Bainbridge Island",
    sailingDate: new Date("2023-12-21T00:00:00.000Z"),
    departures: [
      {
        sailingId: 1,
        schedRouteId: 1,
        departureTime: new Date("2023-12-21T14:30:00.000Z"),
        arrivalTime: new Date("2023-12-21T15:00:00.000Z"),
        vesselId: 1,
        vesselName: "M/V Cathlamet",
        departingTerminalId: 1,
        departingTerminalName: "Seattle",
        arrivingTerminalId: 2,
        arrivingTerminalName: "Bainbridge Island",
        isCancelled: false,
        lastUpdated: new Date("2023-12-21T14:30:00.000Z"),
      },
    ],
    lastUpdated: new Date("2023-12-21T14:30:00.000Z"),
  },
];

export const mockAlertResponse: Alert[] = [
  {
    alertId: 1,
    routeId: 1,
    routeName: "Seattle - Bainbridge Island",
    alertTitle: "Service Delay",
    alertMessage: "Service delayed due to weather conditions",
    startDate: new Date("2023-12-21T14:00:00.000Z"),
    endDate: new Date("2023-12-21T16:00:00.000Z"),
    severity: "medium",
    isActive: true,
  },
];

export const mockActiveSeasonResponse: ActiveSeason[] = [
  {
    seasonId: 1,
    seasonName: "Winter 2023-2024",
    startDate: new Date("2023-10-01T00:00:00.000Z"),
    endDate: new Date("2024-03-31T23:59:59.000Z"),
    isActive: true,
    routeIds: [1, 2, 3],
  },
];

// Mock raw WSF API responses (before transformation)
export const mockRawVesselLocationResponse = [
  {
    VesselID: 1,
    VesselName: "M/V Cathlamet",
    Longitude: -122.3321,
    Latitude: 47.6062,
    Heading: 180,
    Speed: 12.5,
    InService: true,
    AtDock: false,
    DepartingTerminalId: 1,
    DepartingTerminalName: "Seattle",
    ArrivingTerminalId: 2,
    ArrivingTerminalName: "Bainbridge Island",
    ScheduledDeparture: "/Date(1703123400000)/",
    EstimatedArrival: "/Date(1703124000000)/",
    LastUpdated: "/Date(1703123456789)/",
  },
];

export const mockRawTerminalResponse = [
  {
    TerminalId: 1,
    TerminalName: "Seattle",
    SailingId: 1,
    DepartureTime: "/Date(1703123400000)/",
    DriveUpSpaces: 100,
    ReservationSpaces: 50,
    TotalSpaces: 150,
    IsActive: true,
  },
];

// Test utilities
export const createMockFetchResponse = (data: unknown) => ({
  ok: true,
  json: () => Promise.resolve(data),
});

export const createMockFetchError = (status: number, statusText: string) => ({
  ok: false,
  status,
  statusText,
  json: () => Promise.reject(new Error(`${status}: ${statusText}`)),
});

// Mock React Query client
export const mockQueryClient = {
  invalidateQueries: vi.fn(),
  setQueryData: vi.fn(),
  getQueryData: vi.fn(),
  clear: vi.fn(),
};
