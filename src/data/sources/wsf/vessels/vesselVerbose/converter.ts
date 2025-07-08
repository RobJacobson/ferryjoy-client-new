// VesselVerbose data conversion functions

import type { VesselVerbose, VesselVerboseApiResponse } from "./types";

/**
 * Converter function for transforming API response to VesselVerbose object from WSF API
 */
export const toVesselVerbose = (
  apiResponse: VesselVerboseApiResponse
): VesselVerbose => ({
  // Basic vessel information
  vesselID: apiResponse.VesselID,
  vesselName: apiResponse.VesselName,
  vesselAbrv: apiResponse.VesselAbbrev,
  class: apiResponse.Class,
  maxVesselLoad: apiResponse.MaxVesselLoad,
  seatingCapacity: apiResponse.SeatingCapacity,
  maxEnclosedVehicleCapacity: apiResponse.MaxEnclosedVehicleCapacity,
  maxOpenVehicleCapacity: apiResponse.MaxOpenVehicleCapacity,
  maxVehicleHeight: apiResponse.MaxVehicleHeight,
  maxVehicleLength: apiResponse.MaxVehicleLength,
  maxVehicleWidth: apiResponse.MaxVehicleWidth,
  maxVehicleWeight: apiResponse.MaxVehicleWeight,
  opRouteAbrv: apiResponse.OpRouteAbbrev,
  vesselHistory:
    apiResponse.VesselHistory?.map((history) => ({
      vesselName: history.VesselName,
      nameStartDate: history.NameStartDate,
      nameEndDate: history.NameEndDate,
    })) || [],

  // Accommodations
  adaAccessible: apiResponse.ADAAccessible,
  maxEnclosedVehicles: apiResponse.MaxEnclosedVehicles,
  maxOpenVehicles: apiResponse.MaxOpenVehicles,
  carCapacity: apiResponse.CarCapacity,
  truckCapacity: apiResponse.TruckCapacity,
  hasGalley: apiResponse.HasGalley,
  hasTaxiVan: apiResponse.HasTaxiVan,
  hasRestrooms: apiResponse.HasRestrooms,
  hasWiFi: apiResponse.HasWiFi,
  hasElevator: apiResponse.HasElevator,
  hasOverheadCarDeck: apiResponse.HasOverheadCarDeck,
  hasTallVehicleSpace: apiResponse.HasTallVehicleSpace,

  // Statistics
  yearBuilt: apiResponse.YearBuilt,
  yearRebuilt: apiResponse.YearRebuilt,
  length: apiResponse.Length,
  beam: apiResponse.Beam,
  displacement: apiResponse.Displacement,
  horsepower: apiResponse.Horsepower,
  maxSpeed: apiResponse.MaxSpeed,
  engineCount: apiResponse.EngineCount,
  propellerCount: apiResponse.PropellerCount,
});
