// TerminalSailingSpace type definitions

// Raw API response type (PascalCase from WSF Terminals API)
export type TerminalSailingSpaceApiResponse = {
  TerminalID: number;
  TerminalSubjectID: number;
  RegionID: number;
  TerminalName: string;
  TerminalAbbrev: string;
  SortSeq: number;
  DepartingSpaces: {
    Departure: string;
    IsCancelled: boolean;
    VesselID: number;
    VesselName: string;
    MaxSpaceCount: number;
    SpaceForArrivalTerminals: {
      TerminalID: number;
      TerminalName: string;
      VesselID: number;
      VesselName: string;
      DisplayReservableSpace: boolean;
      ReservableSpaceCount?: number;
      ReservableSpaceHexColor?: string;
      DisplayDriveUpSpace: boolean;
      DriveUpSpaceCount?: number;
      DriveUpSpaceHexColor?: string;
      MaxSpaceCount: number;
      ArrivalTerminalIDs: number[];
    }[];
  }[];
  IsNoFareCollected?: boolean;
  NoFareCollectedMsg?: string;
}[];

// Type definitions
export type SpaceForArrivalTerminal = {
  terminalId: number;
  terminalName: string;
  vesselId: number;
  vesselName: string;
  displayReservableSpace: boolean;
  reservableSpaceCount?: number;
  reservableSpaceHexColor?: string;
  displayDriveUpSpace: boolean;
  driveUpSpaceCount?: number;
  driveUpSpaceHexColor?: string;
  maxSpaceCount: number;
  arrivalTerminalIds: number[];
};

export type DepartingSpace = {
  departure: string;
  isCancelled: boolean;
  vesselId: number;
  vesselName: string;
  maxSpaceCount: number;
  spaceForArrivalTerminals: SpaceForArrivalTerminal[];
};

export type TerminalSailingSpace = {
  terminalId: number;
  terminalSubjectId: number;
  regionId: number;
  terminalName: string;
  terminalAbbrev: string;
  sortSeq: number;
  departingSpaces: DepartingSpace[];
  isNoFareCollected?: boolean;
  noFareCollectedMsg?: string;
};
