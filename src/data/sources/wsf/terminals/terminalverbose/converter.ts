// TerminalVerbose data conversion functions

import type {
  TerminalBulletin,
  TerminalSailingSpaceInfo,
  TerminalTransportInfo,
  TerminalVerbose,
  TerminalVerboseApiResponse,
  TerminalWaitTime,
} from "./types";

/**
 * Converter function for transforming API response to TerminalBulletin object from WSF Terminals API
 */
const toTerminalBulletin = (
  apiResponse: TerminalVerboseApiResponse[0]["TerminalBulletins"][0]
): TerminalBulletin => ({
  bulletinId: apiResponse.BulletinID,
  bulletinTitle: apiResponse.BulletinTitle,
  bulletinText: apiResponse.BulletinText,
  bulletinStartDate: apiResponse.BulletinStartDate,
  bulletinEndDate: apiResponse.BulletinEndDate,
  bulletinPriority: apiResponse.BulletinPriority,
});

/**
 * Converter function for transforming API response to TerminalWaitTime object from WSF Terminals API
 */
const toTerminalWaitTime = (
  apiResponse: TerminalVerboseApiResponse[0]["TerminalWaitTimes"]
): TerminalWaitTime => ({
  vehicleWaitTime: apiResponse.VehicleWaitTime,
  walkOnWaitTime: apiResponse.WalkOnWaitTime,
  lastUpdated: apiResponse.LastUpdated,
});

/**
 * Converter function for transforming API response to TerminalSailingSpaceInfo object from WSF Terminals API
 */
const toTerminalSailingSpace = (
  apiResponse: TerminalVerboseApiResponse[0]["TerminalSailingSpace"]
): TerminalSailingSpaceInfo => ({
  driveUpSpaces: apiResponse.DriveUpSpaces,
  reservationSpaces: apiResponse.ReservationSpaces,
  totalSpaces: apiResponse.TotalSpaces,
  lastUpdated: apiResponse.LastUpdated,
});

/**
 * Converter function for transforming API response to TerminalTransportInfo object from WSF Terminals API
 */
const toTerminalTransportInfo = (
  apiResponse: TerminalVerboseApiResponse[0]["TerminalTransports"]
): TerminalTransportInfo => ({
  parkingNotes: apiResponse.ParkingNotes,
  vehicleTips: apiResponse.VehicleTips,
  walkOnTips: apiResponse.WalkOnTips,
  bicycleTips: apiResponse.BicycleTips,
  motorcycleTips: apiResponse.MotorcycleTips,
  oversizedVehicleTips: apiResponse.OversizedVehicleTips,
  handicapAccessNotes: apiResponse.HandicapAccessNotes,
  transitConnections: apiResponse.TransitConnections,
  shuttleService: apiResponse.ShuttleService,
  taxiService: apiResponse.TaxiService,
  carRentalService: apiResponse.CarRentalService,
  bikeRentalService: apiResponse.BikeRentalService,
  otherTransportationNotes: apiResponse.OtherTransportationNotes,
});

/**
 * Converter function for transforming API response to TerminalVerbose object from WSF Terminals API
 */
export const toTerminalVerbose = (
  apiResponse: TerminalVerboseApiResponse[0]
): TerminalVerbose => ({
  terminalId: apiResponse.TerminalID,
  terminalName: apiResponse.TerminalName,
  terminalAbbreviation: apiResponse.TerminalAbbreviation,
  terminalDescription: apiResponse.TerminalDescription,
  terminalLocation: apiResponse.TerminalLocation,
  terminalAddress: apiResponse.TerminalAddress,
  terminalCity: apiResponse.TerminalCity,
  terminalState: apiResponse.TerminalState,
  terminalZipCode: apiResponse.TerminalZipCode,
  terminalPhone: apiResponse.TerminalPhone,
  terminalEmail: apiResponse.TerminalEmail,
  terminalWebsite: apiResponse.TerminalWebsite,
  terminalLatitude: apiResponse.TerminalLatitude,
  terminalLongitude: apiResponse.TerminalLongitude,
  terminalElevation: apiResponse.TerminalElevation,
  terminalTimezone: apiResponse.TerminalTimezone,
  terminalFacilities: apiResponse.TerminalFacilities,
  terminalServices: apiResponse.TerminalServices,
  terminalHours: apiResponse.TerminalHours,
  terminalNotes: apiResponse.TerminalNotes,
  terminalBulletins: apiResponse.TerminalBulletins.map(toTerminalBulletin),
  terminalWaitTimes: toTerminalWaitTime(apiResponse.TerminalWaitTimes),
  terminalSailingSpace: toTerminalSailingSpace(
    apiResponse.TerminalSailingSpace
  ),
  terminalTransports: toTerminalTransportInfo(apiResponse.TerminalTransports),
});

/**
 * Converter function for transforming API response array to TerminalVerbose array from WSF Terminals API
 */
export const toTerminalVerboses = (
  apiResponse: TerminalVerboseApiResponse
): TerminalVerbose[] => apiResponse.map(toTerminalVerbose);
