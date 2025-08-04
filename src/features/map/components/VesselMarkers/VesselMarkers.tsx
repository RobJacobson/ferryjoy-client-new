import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { useVesselLocations } from "@/data/contexts";
import { useVesselAnimation } from "@/features/map/hooks/useVesselAnimation";
import { useBottomSheet, useMapState } from "@/shared/contexts";
import { cn } from "@/shared/lib/utils/cn";
import { MarkerView } from "@/shared/mapbox/MarkerView";

/**
 * Component that renders vessel markers on the map
 * Uses simple debounce to prevent z-jump glitches
 */
const VesselMarkers = () => {
  const { zoom, pitch } = useMapState();
  const { openBottomSheet } = useBottomSheet();
  // const animatedVessels = useVesselAnimation();
  const { vesselLocations } = useVesselLocations();
  const [renderVessels, setRenderVessels] = useState<VesselLocation[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Only show vessels when zoomed in enough
  const shouldShowVessels = zoom >= 8;

  // Simple debounce to prevent z-jump
  useEffect(() => {
    if (!vesselLocations.length) {
      setRenderVessels([]);
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setRenderVessels(vesselLocations);
    }, 150); // 150ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [vesselLocations]);

  const vesselMarkers =
    !shouldShowVessels || !renderVessels.length
      ? []
      : (() => {
          // Calculate scale factor based on zoom level
          const baseZoom = 8;
          const scaleFactor = Math.max(
            0.67,
            Math.min(2, 1.5 ** (zoom - baseZoom))
          );

          return renderVessels.map((vessel: VesselLocation) => {
            const handleVesselPress = () => {
              openBottomSheet({
                id: vessel.VesselID.toString(),
                name: vessel.VesselName || `Vessel ${vessel.VesselID}`,
                type: "vessel",
                data: vessel,
              });
            };

            return (
              <MarkerView
                key={`${vessel.VesselID}-${Math.round(vessel.Longitude * 1000)}-${Math.round(vessel.Latitude * 1000)}`}
                coordinate={[vessel.Longitude, vessel.Latitude]}
                anchor="bottom"
                allowOverlap={true}
              >
                <TouchableOpacity
                  onPress={handleVesselPress}
                  style={{
                    zIndex: 1000,
                    transform: [
                      { scale: scaleFactor },
                      { rotateX: `${-pitch}deg` },
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
