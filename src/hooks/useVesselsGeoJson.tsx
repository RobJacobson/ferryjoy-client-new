import { featureCollection, point } from "@turf/turf";
import { useMemo } from "react";

import { useVesselPositionsSmoothed } from "@/data/contexts/VesselPositionsSmoothed";
import type { VesselLocation } from "@/data/wsf/vessels/types";

/**
 * Custom hook that converts smoothed vessel positions to GeoJSON format
 * Uses Turf.js for proper GeoJSON creation
 */
export const useVesselsGeoJson = (vessels: VesselLocation[]) =>
  useMemo(
    () =>
      featureCollection(
        vessels.map((vessel) =>
          point([vessel.longitude, vessel.latitude], { vessel })
        )
      ),
    [vessels]
  );
