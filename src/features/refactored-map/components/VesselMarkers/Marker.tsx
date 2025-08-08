import { TouchableOpacity } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { cn } from "@/shared/lib/utils/cn";

import { getVesselMarkerStyles } from "./shared";

/**
 * Shared vessel marker content component
 * Renders the visual appearance of a vessel marker
 */
export const Marker = ({
  vessel,
  onPress,
}: {
  vessel: VesselLocation;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={cn(
      "w-6 h-6 rounded-full border-2 border-white shadow-sm",
      getVesselMarkerStyles(vessel.InService)
    )}
  />
);
