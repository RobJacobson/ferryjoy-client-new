import { Text, View } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { useVesselAnimation } from "@/features/map/hooks/useVesselAnimation";
import { useMapState } from "@/shared/contexts";
import { cn } from "@/shared/lib/utils/cn";
import { MarkerView } from "@/shared/mapbox/MarkerView";

/**
 * Component that renders vessel markers on the map
 * Uses smoothed vessel data for fluid animations
 */
const VesselMarkers = () => {
  const { zoom, pitch } = useMapState();
  const animatedVessels = useVesselAnimation();

  // Only show vessels when zoomed in enough
  const shouldShowVessels = zoom >= 8;

  const vesselMarkers =
    !shouldShowVessels || !animatedVessels.length
      ? []
      : (() => {
          // Calculate scale factor based on zoom level
          const baseZoom = 8;
          const scaleFactor = Math.max(
            0.67,
            Math.min(2, 1.5 ** (zoom - baseZoom))
          );

          return animatedVessels.map((vessel: VesselLocation) => {
            return (
              <MarkerView
                key={vessel.VesselID}
                coordinate={[vessel.Longitude, vessel.Latitude]}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View
                  style={{
                    transform: [
                      { scale: scaleFactor },
                      { rotateX: `${pitch}deg` },
                    ],
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 border-white shadow-sm",
                    vessel.InService ? "bg-pink-200" : "bg-gray-300"
                  )}
                />
              </MarkerView>
            );
          });
        })();

  if (!shouldShowVessels) return null;

  return <>{vesselMarkers}</>;
};

export default VesselMarkers;
