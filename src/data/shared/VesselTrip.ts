// Type definition
export type VesselTrip = {
  vesselID: number;
  vesselName: string;
  depTermID: number;
  depTermName: string;
  depTermAbrv: string;
  arvTermID: number | null; // Optional per WSF spec
  arvTermName: string | null; // Optional per WSF spec
  arvTermAbrv: string | null; // Optional per WSF spec
  inService: boolean;
  leftDock: Date | null; // Optional per WSF spec
  eta: Date | null; // Optional per WSF spec
  schedDep: Date | null; // Optional per WSF spec
  opRouteAbrv: string; // Array of route abbreviations
  vesselPosNum: number | null; // Optional per WSF spec
  sortSeq: number;
  timeStamp: Date; // Required per WSF spec
};

export type VesselPosition = {
  lat: number;
  lon: number;
  speed: number;
  atDock: boolean;
};
