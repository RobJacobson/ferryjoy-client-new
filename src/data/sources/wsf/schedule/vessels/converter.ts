// Converter function for vessels

import type { Vessel } from "../shared/types";
import type { WsfVesselResponse } from "./types";

/**
 * Converts WSF API vessel response to domain model
 */
export const toVessel = (data: WsfVesselResponse): Vessel => ({
  id: data.VesselID,
  name: data.VesselName,
  abbreviation: data.VesselAbbreviation,
  vesselClass: data.VesselClass,
  isActive: data.IsActive,
  capacity: {
    passengers: data.Capacity.Passengers,
    vehicles: data.Capacity.Vehicles,
  },
});
