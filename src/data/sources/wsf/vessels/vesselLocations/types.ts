import type { WsfDateString } from "../../shared/utils";

// Raw API response type (PascalCase from WSF API)
export type WsfVesselLocationResponse = {
  VesselID: number;
  VesselName: string;
  VesselAbrv: string;
  Lat: number;
  Lon: number;
  Speed: number;
  Heading: number;
  InService: boolean;
  DepTermAbrv: string;
  ArvTermAbrv: string | null;
  ETA: WsfDateString | null;
  TimeStamp: WsfDateString;
};

// Domain model (camelCase)
export type VesselLocation = {
  vesselID: number;
  vesselName: string;
  vesselAbrv: string;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  inService: boolean;
  depTermAbrv: string;
  arvTermAbrv: string | null;
  eta: Date | null;
  timestamp: Date;
};

// Position type for vessel location coordinates and movement
export type VesselPosition = {
  lat: number;
  lon: number;
  speed: number;
  heading: number;
};
