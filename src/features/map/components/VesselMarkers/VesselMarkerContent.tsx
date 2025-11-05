/**
 * Vessel marker presentation component
 * Uses expo-blur for true native backdrop blur effects across all platforms
 * Used as a child of ScaledMarker for the complete vessel marker
 */
import { BlurView } from "expo-blur";
import { View } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { cn } from "@/shared/lib/utils";

export const VesselMarkerContent = ({ vessel }: { vessel: VesselLocation }) => {
  const isInService = vessel.InService;

  return (
    <View
      className={cn(
        "relative h-24 w-24 overflow-hidden rounded-full border-[8px] border-pink-300 bg-white/50",
        isInService ? "z-10" : "z-0"
      )}
      style={{
        opacity: isInService ? 1 : 0.25,
        elevation: isInService ? 8 : 4,
      }}
    >
      {/* Native backdrop blur effect using expo-blur */}
      <BlurView
        className="absolute inset-0"
        experimentalBlurMethod="dimezisBlurView"
        intensity={50}
        tint="default"
      />
    </View>
  );
};
