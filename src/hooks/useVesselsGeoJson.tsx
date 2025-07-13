import { featureCollection, point } from "@turf/turf";
import { useMemo } from "react";
import type { VesselLocation } from "wsdot-api-client";

import { useVesselPositions } from "@/data/contexts";

/**
 * Custom hook that converts smoothed vessel positions to GeoJSON format
 * Uses Turf.js for proper GeoJSON creation
 */
export const useVesselsGeoJson = (vessels: VesselLocation[]) =>
  useMemo(
    () =>
      featureCollection(
        vessels.map((vessel) =>
          point([vessel.Longitude, vessel.Latitude], { vessel })
        )
      ),
    [vessels]
  );
