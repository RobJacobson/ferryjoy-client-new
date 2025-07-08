// Type definition
export type VesselTrip = {
  id: number;
  // WSF fields
  vesselID: number;
  vesselName: string;
  vesselAbrv: string;
  depTermID: number;
  // depTermName: string;
  depTermAbrv: string;
  arvTermID: number | null; // Optional per WSF spec
  // arvTermName: string | null; // Optional per WSF spec
  arvTermAbrv: string | null; // Optional per WSF spec
  inService: boolean;
  eta: Date | null; // Optional per WSF spec
  schedDep: Date | null; // Optional per WSF spec
  opRouteAbrv: string; // Array of route abbreviations
  vesselPosNum: number | null; // Optional per WSF spec
  sortSeq: number;

  // WSF timestamp of when the vessel arrived at dock
  timeStart: Date | null;

  // WSF timestamp of when the vessel left the dock, maps to leftDock
  timeLeftDock: Date | null;

  // WSF timestamp of when the vessel arrived at the destination
  timeArrived: Date | null;

  // WSF timestamp of when the vessel trip was last updated
  timeUpdated: Date | null;
};
