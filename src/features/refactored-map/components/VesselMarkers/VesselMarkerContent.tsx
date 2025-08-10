/**
 * Vessel marker presentation component
 * Uses expo-blur for true native backdrop blur effects across all platforms
 * Used as a child of ScaledMarker for the complete vessel marker
 */

// import { BlurView } from "expo-blur";
import { View } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { cn } from "@/shared/lib/utils";

export const VesselMarkerContent = ({ vessel }: { vessel: VesselLocation }) => {
  const isInService = vessel.InService;

  return (
    <View className="relative">
      {/* Native backdrop blur effect using expo-blur */}
      {/* <BlurView
        intensity={50}
        tint="default"
        className={cn(
          "absolute rounded-full h-32 w-32",
          "overflow-hidden",
          // Center the blur view behind the marker
          "-top-4 -left-4"
        )}
      /> */}

      {/* Main vessel marker content */}
      <View
        className={cn(
          "relative rounded-full h-24 w-24 border-[4px]",
          isInService ? "z-10" : "z-0",
          isInService ? "border-pink-400/50" : "border-gray-400/25",
          isInService ? "bg-pink-200/50" : "bg-gray-200/25"
        )}
        style={{
          opacity: vessel.InService ? 1 : 1,
          // Native shadow properties for depth
          shadowColor: isInService ? "#ec4899" : "#6b7280",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isInService ? 0.3 : 0.2,
          shadowRadius: 8,
          // Elevation for Android
          elevation: isInService ? 8 : 4,
        }}
      />
    </View>
  );
};
