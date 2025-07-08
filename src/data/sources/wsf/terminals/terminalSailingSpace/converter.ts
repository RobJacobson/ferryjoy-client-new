// TerminalSailingSpace data conversion functions

import type {
  DepartingSpace,
  SpaceForArrivalTerminal,
  TerminalSailingSpace,
  TerminalSailingSpaceApiResponse,
} from "./types";

/**
 * Converter function for transforming API response to SpaceForArrivalTerminal object from WSF Terminals API
 */
const toSpaceForArrivalTerminal = (
  apiResponse: TerminalSailingSpaceApiResponse[0]["DepartingSpaces"][0]["SpaceForArrivalTerminals"][0]
): SpaceForArrivalTerminal => ({
  terminalId: apiResponse.TerminalID,
  terminalName: apiResponse.TerminalName,
  vesselId: apiResponse.VesselID,
  vesselName: apiResponse.VesselName,
  displayReservableSpace: apiResponse.DisplayReservableSpace,
  reservableSpaceCount: apiResponse.ReservableSpaceCount,
  reservableSpaceHexColor: apiResponse.ReservableSpaceHexColor,
  displayDriveUpSpace: apiResponse.DisplayDriveUpSpace,
  driveUpSpaceCount: apiResponse.DriveUpSpaceCount,
  driveUpSpaceHexColor: apiResponse.DriveUpSpaceHexColor,
  maxSpaceCount: apiResponse.MaxSpaceCount,
  arrivalTerminalIds: apiResponse.ArrivalTerminalIDs,
});

/**
 * Converter function for transforming API response to DepartingSpace object from WSF Terminals API
 */
const toDepartingSpace = (
  apiResponse: TerminalSailingSpaceApiResponse[0]["DepartingSpaces"][0]
): DepartingSpace => ({
  departure: apiResponse.Departure,
  isCancelled: apiResponse.IsCancelled,
  vesselId: apiResponse.VesselID,
  vesselName: apiResponse.VesselName,
  maxSpaceCount: apiResponse.MaxSpaceCount,
  spaceForArrivalTerminals: apiResponse.SpaceForArrivalTerminals.map(
    toSpaceForArrivalTerminal
  ),
});

/**
 * Converter function for transforming API response to TerminalSailingSpace object from WSF Terminals API
 */
export const toTerminalSailingSpace = (
  apiResponse: TerminalSailingSpaceApiResponse[0]
): TerminalSailingSpace => ({
  terminalId: apiResponse.TerminalID,
  terminalSubjectId: apiResponse.TerminalSubjectID,
  regionId: apiResponse.RegionID,
  terminalName: apiResponse.TerminalName,
  terminalAbbrev: apiResponse.TerminalAbbrev,
  sortSeq: apiResponse.SortSeq,
  departingSpaces: apiResponse.DepartingSpaces.map(toDepartingSpace),
  isNoFareCollected: apiResponse.IsNoFareCollected,
  noFareCollectedMsg: apiResponse.NoFareCollectedMsg,
});
