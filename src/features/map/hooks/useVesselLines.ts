import { bezierSpline, featureCollection } from "@turf/turf";

import { useVesselPings } from "@/data/contexts";
import { locationsToLineFeature } from "@/shared/utils/geoJson";

import { useVesselAnimation } from "./useVesselAnimation";

/**
 * Hook for processing vessel ping data into line features
 */
export const useVesselLines = () => {
  const { vesselPings } = useVesselPings();
  const animatedVessels = useVesselAnimation();

  // Replace last ping with current animated location for each vessel
  const vesselPingsCorrected =
    !vesselPings || !animatedVessels
      ? []
      : animatedVessels
          .filter((vl) => vesselPings[vl.VesselID]?.length > 0)
          .map((vl) => [
            ...vesselPings[vl.VesselID].filter(
              (ping) => ping.TimeStamp < vl.TimeStamp
            ),
            vl,
          ])
          .filter((pings) => pings.length >= 2); // Ensure at least 2 points for line

  // Convert ping arrays to GeoJSON line features
  const vesselLinesGeoJson =
    !vesselPingsCorrected || vesselPingsCorrected.length === 0
      ? undefined
      : (() => {
          const features = vesselPingsCorrected.map((pings) => {
            const lineFeature = locationsToLineFeature(pings);
            try {
              return bezierSpline(lineFeature, {
                resolution: 10000, // Higher = more interpolated points = smoother
                sharpness: 0.8, // Higher = more curved/smooth
              });
            } catch {
              return lineFeature;
            }
          });

          return features.length > 0 ? featureCollection(features) : undefined;
        })();

  return vesselLinesGeoJson;
};
