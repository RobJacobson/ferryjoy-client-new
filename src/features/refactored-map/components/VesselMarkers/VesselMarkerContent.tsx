/**
 * Vessel marker presentation component
 * Contains only the visual styling and appearance logic
 * Used as a child of ScaledMarker for the complete vessel marker
 */

import { View } from "react-native";
import type { VesselLocation } from "ws-dottie";

import { cn } from "@/shared/lib/utils";

// Shadow constants for glass effect
const OUTER_DROP_SHADOW = "2px 2px 4px rgba(0,0,0,0.3)"; // Subtle outer shadow for depth
const CENTRAL_WHITE_GLOW = "inset 0px 0px 20px rgba(255,255,255,0.4)"; // Central light source simulation
const TOP_LEFT_DEPTH = "inset 6px 6px 16px rgba(0,0,0,0.15)"; // Top-left shadow for 3D effect
const BOTTOM_RIGHT_HIGHLIGHT = "inset -6px -6px 16px rgba(255,255,255,0.4)"; // Bottom-right reflection
const INNER_RIM_GLOW = "inset 0px 0px 8px rgba(255,255,255,0.2)"; // Subtle inner rim lighting

export const VesselMarkerContent = ({ vessel }: { vessel: VesselLocation }) => {
  const isInService = vessel.InService;

  // Combine all shadows into a single string
  const glassShadow = [
    OUTER_DROP_SHADOW,
    CENTRAL_WHITE_GLOW,
    TOP_LEFT_DEPTH,
    BOTTOM_RIGHT_HIGHLIGHT,
    INNER_RIM_GLOW,
  ].join(",");

  return (
    <View
      className={cn(
        "rounded-full h-24 w-24 border-[4px] backdrop-blur-[8px]",
        isInService ? "z-10" : "z-0",
        isInService ? "border-pink-400/50" : "border-gray-400/25",
        isInService ? "bg-pink-200/50" : "bg-gray-200/25",
        // Rounded glass effect using combined shadows
        `shadow-[${glassShadow}]`
      )}
      style={{
        opacity: vessel.InService ? 1 : 1,
      }}
    />
  );
};
