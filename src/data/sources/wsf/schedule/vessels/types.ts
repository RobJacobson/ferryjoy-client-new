// Types for vessels

export type { Vessel } from "../shared/types";

/**
 * Raw API response type for vessel
 */
export type WsfVesselResponse = {
  VesselID: number;
  VesselName: string;
  VesselAbbreviation: string;
  VesselClass: string;
  IsActive: boolean;
  Capacity: {
    Passengers: number;
    Vehicles: number;
  };
};
