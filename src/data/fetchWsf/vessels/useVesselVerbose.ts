import { type UseQueryOptions, useQuery } from "@tanstack/react-query";

import log from "@/lib/logger";

import { API_BASE, API_KEY, fetchWsf } from "../../shared/fetch";
import { useCacheFlushDate } from "./useCacheFlushDate";

const SECOND = 1000;
const HOUR = 60 * 60 * SECOND;

// Raw API response types (PascalCase from WSF API)
type VesselHistoryApiResponse = {
  VesselName: string;
  NameStartDate: Date;
  NameEndDate: Date;
};

type VesselVerboseApiResponse = {
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

// Mapping function
const mapVesselVerbose = (
  apiResponse: VesselVerboseApiResponse
): VesselVerbose => {
  return {
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
  };
};

// API function
export const getVesselVerbose = async (): Promise<VesselVerbose[]> => {
  log.debug("Fetching vessel verbose data");
  const url = `${API_BASE}/vesselverbose?apiaccesscode=${API_KEY}`;
  const rawData = await fetchWsf<VesselVerboseApiResponse[]>(url);
  if (!rawData) return [];

  const result = rawData.map(mapVesselVerbose);

  if (result.length > 0) {
    log.info(`Retrieved ${result.length} vessel verbose records`);
  }
  return result;
};

// Hook
export const useVesselVerbose = (
  options?: Partial<UseQueryOptions<VesselVerbose[]>>
) => {
  const { data } = useCacheFlushDate();

  return useQuery({
    queryKey: ["wsf", "vessels", "verbose"],
    queryFn: getVesselVerbose,
    staleTime: HOUR,
    gcTime: 2 * HOUR,
    retry: 10,
    retryDelay: (attemptIndex: number) => SECOND * 2 ** (attemptIndex + 2),
    ...(data?.cacheDate && {
      queryKeyHashFn: (queryKey: readonly unknown[]) =>
        JSON.stringify([...queryKey, data.cacheDate.getTime()]),
    }),
    ...options,
  });
};
