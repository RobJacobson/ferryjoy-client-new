// VesselVerbose type definitions

// Raw API response types (PascalCase from WSF API)
export type VesselHistoryApiResponse = {
  VesselName: string;
  NameStartDate: Date;
  NameEndDate: Date;
};

export type VesselVerboseApiResponse = {
  // Basic vessel information
  VesselID: number;
  VesselName: string;
  VesselAbbrev: string;
  Class: string;
  MaxVesselLoad: number;
  SeatingCapacity: number;
  MaxEnclosedVehicleCapacity: number;
  MaxOpenVehicleCapacity: number;
  MaxVehicleHeight: number;
  MaxVehicleLength: number;
  MaxVehicleWidth: number;
  MaxVehicleWeight: number;
  OpRouteAbbrev: string[];
  VesselHistory?: VesselHistoryApiResponse[];

  // Accommodations
  ADAAccessible: boolean;
  MaxEnclosedVehicles: number;
  MaxOpenVehicles: number;
  CarCapacity: number;
  TruckCapacity: number;
  HasGalley: boolean;
  HasTaxiVan: boolean;
  HasRestrooms: boolean;
  HasWiFi: boolean;
  HasElevator: boolean;
  HasOverheadCarDeck: boolean;
  HasTallVehicleSpace: boolean;

  // Statistics
  YearBuilt: number;
  YearRebuilt?: number;
  Length: number;
  Beam: number;
  Displacement: number;
  Horsepower: number;
  MaxSpeed: number;
  EngineCount: number;
  PropellerCount: number;
};

// Type definition
export type VesselVerbose = {
  // Basic vessel information
  vesselID: number;
  vesselName: string;
  vesselAbrv: string;
  class: string;
  maxVesselLoad: number;
  seatingCapacity: number;
  maxEnclosedVehicleCapacity: number;
  maxOpenVehicleCapacity: number;
  maxVehicleHeight: number;
  maxVehicleLength: number;
  maxVehicleWidth: number;
  maxVehicleWeight: number;
  opRouteAbrv: string[];
  vesselHistory: Array<{
    vesselName: string;
    nameStartDate: Date;
    nameEndDate: Date;
  }>;

  // Accommodations
  adaAccessible: boolean;
  maxEnclosedVehicles: number;
  maxOpenVehicles: number;
  carCapacity: number;
  truckCapacity: number;
  hasGalley: boolean;
  hasTaxiVan: boolean;
  hasRestrooms: boolean;
  hasWiFi: boolean;
  hasElevator: boolean;
  hasOverheadCarDeck: boolean;
  hasTallVehicleSpace: boolean;

  // Statistics
  yearBuilt: number;
  yearRebuilt?: number;
  length: number;
  beam: number;
  displacement: number;
  horsepower: number;
  maxSpeed: number;
  engineCount: number;
  propellerCount: number;
};
