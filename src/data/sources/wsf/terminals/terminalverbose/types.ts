// TerminalVerbose type definitions

// Raw API response type (PascalCase from WSF Terminals API)
export type TerminalVerboseApiResponse = {
  TerminalID: number;
  TerminalName: string;
  TerminalAbbreviation: string;
  TerminalDescription: string;
  TerminalLocation: string;
  TerminalAddress: string;
  TerminalCity: string;
  TerminalState: string;
  TerminalZipCode: string;
  TerminalPhone: string;
  TerminalEmail: string;
  TerminalWebsite: string;
  TerminalLatitude: number;
  TerminalLongitude: number;
  TerminalElevation: number;
  TerminalTimezone: string;
  TerminalFacilities: string;
  TerminalServices: string;
  TerminalHours: string;
  TerminalNotes: string;
  TerminalBulletins: {
    BulletinID: number;
    BulletinTitle: string;
    BulletinText: string;
    BulletinStartDate: string;
    BulletinEndDate: string;
    BulletinPriority: number;
  }[];
  TerminalWaitTimes: {
    VehicleWaitTime: number;
    WalkOnWaitTime: number;
    LastUpdated: string;
  };
  TerminalSailingSpace: {
    DriveUpSpaces: number;
    ReservationSpaces: number;
    TotalSpaces: number;
    LastUpdated: string;
  };
  TerminalTransports: {
    ParkingNotes: string;
    VehicleTips: string;
    WalkOnTips: string;
    BicycleTips: string;
    MotorcycleTips: string;
    OversizedVehicleTips: string;
    HandicapAccessNotes: string;
    TransitConnections: string;
    ShuttleService: string;
    TaxiService: string;
    CarRentalService: string;
    BikeRentalService: string;
    OtherTransportationNotes: string;
  };
}[];

// Type definitions
export type TerminalBulletin = {
  bulletinId: number;
  bulletinTitle: string;
  bulletinText: string;
  bulletinStartDate: string;
  bulletinEndDate: string;
  bulletinPriority: number;
};

export type TerminalWaitTime = {
  vehicleWaitTime: number;
  walkOnWaitTime: number;
  lastUpdated: string;
};

export type TerminalSailingSpaceInfo = {
  driveUpSpaces: number;
  reservationSpaces: number;
  totalSpaces: number;
  lastUpdated: string;
};

export type TerminalTransportInfo = {
  parkingNotes: string;
  vehicleTips: string;
  walkOnTips: string;
  bicycleTips: string;
  motorcycleTips: string;
  oversizedVehicleTips: string;
  handicapAccessNotes: string;
  transitConnections: string;
  shuttleService: string;
  taxiService: string;
  carRentalService: string;
  bikeRentalService: string;
  otherTransportationNotes: string;
};

export type TerminalVerbose = {
  terminalId: number;
  terminalName: string;
  terminalAbbreviation: string;
  terminalDescription: string;
  terminalLocation: string;
  terminalAddress: string;
  terminalCity: string;
  terminalState: string;
  terminalZipCode: string;
  terminalPhone: string;
  terminalEmail: string;
  terminalWebsite: string;
  terminalLatitude: number;
  terminalLongitude: number;
  terminalElevation: number;
  terminalTimezone: string;
  terminalFacilities: string;
  terminalServices: string;
  terminalHours: string;
  terminalNotes: string;
  terminalBulletins: TerminalBulletin[];
  terminalWaitTimes: TerminalWaitTime;
  terminalSailingSpace: TerminalSailingSpaceInfo;
  terminalTransports: TerminalTransportInfo;
};
