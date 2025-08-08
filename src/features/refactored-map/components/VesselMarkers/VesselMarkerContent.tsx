import { TouchableOpacity } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { useBottomSheet } from "@/shared/contexts";
import { cn } from "@/shared/lib/utils/cn";

import { getVesselAccessibilityLabel } from "./shared";

/**
 * Shared vessel marker TouchableOpacity content component
 * Used by both native and web implementations
 */
export const VesselMarkerContent = ({ vessel }: { vessel: VesselLocation }) => {
  const { openBottomSheet } = useBottomSheet();

  const handleVesselPress = () => {
    openBottomSheet({
      id: vessel.VesselID.toString(),
      name: vessel.VesselName || `Vessel ${vessel.VesselID}`,
      type: "vessel",
      data: vessel,
    });
  };

  return (
    <TouchableOpacity
      onPress={handleVesselPress}
      accessibilityLabel={getVesselAccessibilityLabel(vessel)}
      className={cn(
        "w-6 h-6 rounded-full border-2 border-white shadow-sm",
        vessel.InService ? "bg-pink-200" : "bg-gray-300"
      )}
    />
  );
};
