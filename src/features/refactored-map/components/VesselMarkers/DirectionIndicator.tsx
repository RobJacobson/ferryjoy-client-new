/**
 * Direction indicator component for vessel markers
 * Provides multiple whimsical, rounded variants to show travel direction
 * Designed to work alongside the glass circle without rotating the glass effect
 */

import { View } from "react-native";
import { Circle, Ellipse, G, Path, Polygon, Svg } from "react-native-svg";
import type { VesselLocation } from "ws-dottie";

import { cn } from "@/shared/lib/utils";

type DirectionIndicatorProps = {
  vessel: VesselLocation;
  size: number; // Size of the main circle (96 or 64)
  className?: string;
};

// Helper function to calculate direction angle from vessel data
const getVesselDirection = (vessel: VesselLocation): number => {
  // This would need to be implemented based on your vessel data structure
  // For now, using a placeholder that could be based on:
  // - vessel.Heading (if available)
  // - vessel.Course (if available)
  // - vessel.Speed (if available)
  // - Or calculated from previous positions
  return vessel.Heading || 0; // Assuming Heading exists, fallback to 0
};

// Variant 1: Rounded Arrow with Tail
const RoundedArrow = ({
  size,
  direction,
  isInService,
}: {
  size: number;
  direction: number;
  isInService: boolean;
}) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <G transform={`rotate(${direction} ${size / 2} ${size / 2})`}>
      {/* Rounded arrow body */}
      <Path
        d={`M ${size / 2 - 8} ${size / 2 + 12} 
            Q ${size / 2 - 4} ${size / 2 + 8} ${size / 2} ${size / 2 + 8}
            Q ${size / 2 + 4} ${size / 2 + 8} ${size / 2 + 8} ${size / 2 + 12}
            Q ${size / 2 + 6} ${size / 2 + 6} ${size / 2 + 4} ${size / 2 + 4}
            Q ${size / 2 + 2} ${size / 2 + 2} ${size / 2} ${size / 2 + 2}
            Q ${size / 2 - 2} ${size / 2 + 2} ${size / 2 - 4} ${size / 2 + 4}
            Q ${size / 2 - 6} ${size / 2 + 6} ${size / 2 - 8} ${size / 2 + 12} Z`}
        fill={isInService ? "#f472b6" : "#9ca3af"}
        opacity="0.8"
      />
    </G>
  </Svg>
);

// Variant 2: Bubbles Trail
const BubblesTrail = ({
  size,
  direction,
  isInService,
}: {
  size: number;
  direction: number;
  isInService: boolean;
}) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <G transform={`rotate(${direction} ${size / 2} ${size / 2})`}>
      {/* Bubbles flowing in direction */}
      <Circle
        cx={size / 2 + 6}
        cy={size / 2 + 8}
        r="3"
        fill={isInService ? "#f9a8d4" : "#d1d5db"}
        opacity="0.6"
      />
      <Circle
        cx={size / 2 + 12}
        cy={size / 2 + 12}
        r="2"
        fill={isInService ? "#f9a8d4" : "#d1d5db"}
        opacity="0.4"
      />
      <Circle
        cx={size / 2 + 18}
        cy={size / 2 + 16}
        r="2.5"
        fill={isInService ? "#f9a8d4" : "#d1d5db"}
        opacity="0.3"
      />
    </G>
  </Svg>
);

// Variant 3: Wavy Motion Lines
const WavyMotion = ({
  size,
  direction,
  isInService,
}: {
  size: number;
  direction: number;
  isInService: boolean;
}) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <G transform={`rotate(${direction} ${size / 2} ${size / 2})`}>
      {/* Wavy motion lines */}
      <Path
        d={`M ${size / 2 - 4} ${size / 2 + 8} 
            Q ${size / 2} ${size / 2 + 6} ${size / 2 + 4} ${size / 2 + 8}
            Q ${size / 2 + 8} ${size / 2 + 10} ${size / 2 + 12} ${size / 2 + 8}
            Q ${size / 2 + 16} ${size / 2 + 6} ${size / 2 + 20} ${size / 2 + 8}`}
        stroke={isInService ? "#ec4899" : "#9ca3af"}
        strokeWidth="2"
        fill="none"
        opacity="0.7"
      />
      <Path
        d={`M ${size / 2 - 2} ${size / 2 + 12} 
            Q ${size / 2 + 2} ${size / 2 + 10} ${size / 2 + 6} ${size / 2 + 12}
            Q ${size / 2 + 10} ${size / 2 + 14} ${size / 2 + 14} ${size / 2 + 12}
            Q ${size / 2 + 18} ${size / 2 + 10} ${size / 2 + 22} ${size / 2 + 12}`}
        stroke={isInService ? "#ec4899" : "#9ca3af"}
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
    </G>
  </Svg>
);

// Variant 4: Rounded Speed Lines
const SpeedLines = ({
  size,
  direction,
  isInService,
}: {
  size: number;
  direction: number;
  isInService: boolean;
}) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <G transform={`rotate(${direction} ${size / 2} ${size / 2})`}>
      {/* Rounded speed lines */}
      <Path
        d={`M ${size / 2 + 8} ${size / 2 + 6} 
            Q ${size / 2 + 12} ${size / 2 + 8} ${size / 2 + 16} ${size / 2 + 6}
            Q ${size / 2 + 20} ${size / 2 + 4} ${size / 2 + 24} ${size / 2 + 6}`}
        stroke={isInService ? "#f472b6" : "#9ca3af"}
        strokeWidth="3"
        fill="none"
        opacity="0.8"
        strokeLinecap="round"
      />
      <Path
        d={`M ${size / 2 + 6} ${size / 2 + 10} 
            Q ${size / 2 + 10} ${size / 2 + 12} ${size / 2 + 14} ${size / 2 + 10}
            Q ${size / 2 + 18} ${size / 2 + 8} ${size / 2 + 22} ${size / 2 + 10}`}
        stroke={isInService ? "#f472b6" : "#9ca3af"}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
    </G>
  </Svg>
);

// Variant 5: Floating Hearts
const FloatingHearts = ({
  size,
  direction,
  isInService,
}: {
  size: number;
  direction: number;
  isInService: boolean;
}) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <G transform={`rotate(${direction} ${size / 2} ${size / 2})`}>
      {/* Heart shapes floating in direction */}
      <Path
        d={`M ${size / 2 + 8} ${size / 2 + 10} 
            Q ${size / 2 + 8} ${size / 2 + 8} ${size / 2 + 6} ${size / 2 + 6}
            Q ${size / 2 + 4} ${size / 2 + 4} ${size / 2 + 2} ${size / 2 + 6}
            Q ${size / 2} ${size / 2 + 8} ${size / 2} ${size / 2 + 10}
            Q ${size / 2} ${size / 2 + 12} ${size / 2 + 2} ${size / 2 + 14}
            Q ${size / 2 + 4} ${size / 2 + 16} ${size / 2 + 6} ${size / 2 + 14}
            Q ${size / 2 + 8} ${size / 2 + 12} ${size / 2 + 8} ${size / 2 + 10} Z`}
        fill={isInService ? "#ec4899" : "#9ca3af"}
        opacity="0.7"
      />
      <Path
        d={`M ${size / 2 + 16} ${size / 2 + 14} 
            Q ${size / 2 + 16} ${size / 2 + 12} ${size / 2 + 14} ${size / 2 + 10}
            Q ${size / 2 + 12} ${size / 2 + 8} ${size / 2 + 10} ${size / 2 + 10}
            Q ${size / 2 + 8} ${size / 2 + 12} ${size / 2 + 8} ${size / 2 + 14}
            Q ${size / 2 + 8} ${size / 2 + 16} ${size / 2 + 10} ${size / 2 + 18}
            Q ${size / 2 + 12} ${size / 2 + 20} ${size / 2 + 14} ${size / 2 + 18}
            Q ${size / 2 + 16} ${size / 2 + 16} ${size / 2 + 16} ${size / 2 + 14} Z`}
        fill={isInService ? "#ec4899" : "#9ca3af"}
        opacity="0.5"
      />
    </G>
  </Svg>
);

// Variant 6: Rounded Comet Tail
const CometTail = ({
  size,
  direction,
  isInService,
}: {
  size: number;
  direction: number;
  isInService: boolean;
}) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <G transform={`rotate(${direction} ${size / 2} ${size / 2})`}>
      {/* Comet tail with rounded particles */}
      <Circle
        cx={size / 2 + 8}
        cy={size / 2 + 8}
        r="2"
        fill={isInService ? "#f9a8d4" : "#d1d5db"}
        opacity="0.8"
      />
      <Circle
        cx={size / 2 + 14}
        cy={size / 2 + 10}
        r="1.5"
        fill={isInService ? "#f9a8d4" : "#d1d5db"}
        opacity="0.6"
      />
      <Circle
        cx={size / 2 + 20}
        cy={size / 2 + 12}
        r="1"
        fill={isInService ? "#f9a8d4" : "#d1d5db"}
        opacity="0.4"
      />
      <Circle
        cx={size / 2 + 26}
        cy={size / 2 + 14}
        r="0.8"
        fill={isInService ? "#f9a8d4" : "#d1d5db"}
        opacity="0.3"
      />
    </G>
  </Svg>
);

// Variant 7: Rounded Arrow with Wings
const WingedArrow = ({
  size,
  direction,
  isInService,
}: {
  size: number;
  direction: number;
  isInService: boolean;
}) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <G transform={`rotate(${direction} ${size / 2} ${size / 2})`}>
      {/* Main arrow body */}
      <Path
        d={`M ${size / 2 - 6} ${size / 2 + 10} 
            Q ${size / 2 - 2} ${size / 2 + 6} ${size / 2} ${size / 2 + 6}
            Q ${size / 2 + 2} ${size / 2 + 6} ${size / 2 + 6} ${size / 2 + 10}
            Q ${size / 2 + 4} ${size / 2 + 8} ${size / 2 + 2} ${size / 2 + 8}
            Q ${size / 2} ${size / 2 + 8} ${size / 2 - 2} ${size / 2 + 8}
            Q ${size / 2 - 4} ${size / 2 + 8} ${size / 2 - 6} ${size / 2 + 10} Z`}
        fill={isInService ? "#f472b6" : "#9ca3af"}
        opacity="0.8"
      />
      {/* Wings */}
      <Path
        d={`M ${size / 2 - 8} ${size / 2 + 4} 
            Q ${size / 2 - 4} ${size / 2 + 2} ${size / 2 - 2} ${size / 2 + 4}
            Q ${size / 2} ${size / 2 + 6} ${size / 2 - 2} ${size / 2 + 8}
            Q ${size / 2 - 4} ${size / 2 + 10} ${size / 2 - 8} ${size / 2 + 8}
            Q ${size / 2 - 10} ${size / 2 + 6} ${size / 2 - 8} ${size / 2 + 4} Z`}
        fill={isInService ? "#f9a8d4" : "#d1d5db"}
        opacity="0.6"
      />
      <Path
        d={`M ${size / 2 + 8} ${size / 2 + 4} 
            Q ${size / 2 + 4} ${size / 2 + 2} ${size / 2 + 2} ${size / 2 + 4}
            Q ${size / 2} ${size / 2 + 6} ${size / 2 + 2} ${size / 2 + 8}
            Q ${size / 2 + 4} ${size / 2 + 10} ${size / 2 + 8} ${size / 2 + 8}
            Q ${size / 2 + 10} ${size / 2 + 6} ${size / 2 + 8} ${size / 2 + 4} Z`}
        fill={isInService ? "#f9a8d4" : "#d1d5db"}
        opacity="0.6"
      />
    </G>
  </Svg>
);

// Variant 8: Rounded Star Trail
const StarTrail = ({
  size,
  direction,
  isInService,
}: {
  size: number;
  direction: number;
  isInService: boolean;
}) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <G transform={`rotate(${direction} ${size / 2} ${size / 2})`}>
      {/* Star shapes */}
      <Path
        d={`M ${size / 2 + 8} ${size / 2 + 8} 
            L ${size / 2 + 10} ${size / 2 + 6} L ${size / 2 + 12} ${size / 2 + 8}
            L ${size / 2 + 10} ${size / 2 + 10} L ${size / 2 + 8} ${size / 2 + 8} Z`}
        fill={isInService ? "#ec4899" : "#9ca3af"}
        opacity="0.8"
      />
      <Path
        d={`M ${size / 2 + 16} ${size / 2 + 10} 
            L ${size / 2 + 18} ${size / 2 + 8} L ${size / 2 + 20} ${size / 2 + 10}
            L ${size / 2 + 18} ${size / 2 + 12} L ${size / 2 + 16} ${size / 2 + 10} Z`}
        fill={isInService ? "#ec4899" : "#9ca3af"}
        opacity="0.6"
      />
      <Path
        d={`M ${size / 2 + 24} ${size / 2 + 12} 
            L ${size / 2 + 26} ${size / 2 + 10} L ${size / 2 + 28} ${size / 2 + 12}
            L ${size / 2 + 26} ${size / 2 + 14} L ${size / 2 + 24} ${size / 2 + 12} Z`}
        fill={isInService ? "#ec4899" : "#9ca3af"}
        opacity="0.4"
      />
    </G>
  </Svg>
);

// Variant 9: Rounded Arrow with Sparkles
const SparklyArrow = ({
  size,
  direction,
  isInService,
}: {
  size: number;
  direction: number;
  isInService: boolean;
}) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <G transform={`rotate(${direction} ${size / 2} ${size / 2})`}>
      {/* Main arrow */}
      <Path
        d={`M ${size / 2 - 4} ${size / 2 + 8} 
            Q ${size / 2} ${size / 2 + 6} ${size / 2 + 4} ${size / 2 + 8}
            Q ${size / 2 + 8} ${size / 2 + 10} ${size / 2 + 12} ${size / 2 + 8}
            Q ${size / 2 + 8} ${size / 2 + 6} ${size / 2 + 4} ${size / 2 + 4}
            Q ${size / 2} ${size / 2 + 2} ${size / 2 - 4} ${size / 2 + 4}
            Q ${size / 2 - 8} ${size / 2 + 6} ${size / 2 - 4} ${size / 2 + 8} Z`}
        fill={isInService ? "#f472b6" : "#9ca3af"}
        opacity="0.8"
      />
      {/* Sparkles */}
      <Circle
        cx={size / 2 + 8}
        cy={size / 2 + 4}
        r="1"
        fill={isInService ? "#fbbf24" : "#d1d5db"}
        opacity="0.9"
      />
      <Circle
        cx={size / 2 + 12}
        cy={size / 2 + 6}
        r="0.8"
        fill={isInService ? "#fbbf24" : "#d1d5db"}
        opacity="0.7"
      />
      <Circle
        cx={size / 2 + 16}
        cy={size / 2 + 8}
        r="0.6"
        fill={isInService ? "#fbbf24" : "#d1d5db"}
        opacity="0.5"
      />
    </G>
  </Svg>
);

// Variant 10: Rounded Arrow with Rainbow Trail
const RainbowArrow = ({
  size,
  direction,
  isInService,
}: {
  size: number;
  direction: number;
  isInService: boolean;
}) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <G transform={`rotate(${direction} ${size / 2} ${size / 2})`}>
      {/* Main arrow */}
      <Path
        d={`M ${size / 2 - 6} ${size / 2 + 10} 
            Q ${size / 2 - 2} ${size / 2 + 8} ${size / 2} ${size / 2 + 8}
            Q ${size / 2 + 2} ${size / 2 + 8} ${size / 2 + 6} ${size / 2 + 10}
            Q ${size / 2 + 4} ${size / 2 + 8} ${size / 2 + 2} ${size / 2 + 6}
            Q ${size / 2} ${size / 2 + 4} ${size / 2 - 2} ${size / 2 + 6}
            Q ${size / 2 - 4} ${size / 2 + 8} ${size / 2 - 6} ${size / 2 + 10} Z`}
        fill={isInService ? "#f472b6" : "#9ca3af"}
        opacity="0.8"
      />
      {/* Rainbow trail */}
      <Path
        d={`M ${size / 2 + 8} ${size / 2 + 6} 
            Q ${size / 2 + 12} ${size / 2 + 8} ${size / 2 + 16} ${size / 2 + 6}
            Q ${size / 2 + 20} ${size / 2 + 4} ${size / 2 + 24} ${size / 2 + 6}`}
        stroke={isInService ? "#ec4899" : "#9ca3af"}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
      <Path
        d={`M ${size / 2 + 10} ${size / 2 + 8} 
            Q ${size / 2 + 14} ${size / 2 + 10} ${size / 2 + 18} ${size / 2 + 8}
            Q ${size / 2 + 22} ${size / 2 + 6} ${size / 2 + 26} ${size / 2 + 8}`}
        stroke={isInService ? "#f9a8d4" : "#d1d5db"}
        strokeWidth="2"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
    </G>
  </Svg>
);

// Main component that renders the selected variant
export const DirectionIndicator = ({
  vessel,
  size,
  className,
}: DirectionIndicatorProps) => {
  const isInService = vessel.InService;
  const direction = getVesselDirection(vessel);

  // You can change this to test different variants
  const variant = "roundedArrow"; // Options: roundedArrow, bubbles, wavy, speed, hearts, comet, winged, stars, sparkly, rainbow

  const renderVariant = () => {
    switch (variant) {
      case "roundedArrow":
        return (
          <RoundedArrow
            size={size}
            direction={direction}
            isInService={isInService}
          />
        );
      case "bubbles":
        return (
          <BubblesTrail
            size={size}
            direction={direction}
            isInService={isInService}
          />
        );
      case "wavy":
        return (
          <WavyMotion
            size={size}
            direction={direction}
            isInService={isInService}
          />
        );
      case "speed":
        return (
          <SpeedLines
            size={size}
            direction={direction}
            isInService={isInService}
          />
        );
      case "hearts":
        return (
          <FloatingHearts
            size={size}
            direction={direction}
            isInService={isInService}
          />
        );
      case "comet":
        return (
          <CometTail
            size={size}
            direction={direction}
            isInService={isInService}
          />
        );
      case "winged":
        return (
          <WingedArrow
            size={size}
            direction={direction}
            isInService={isInService}
          />
        );
      case "stars":
        return (
          <StarTrail
            size={size}
            direction={direction}
            isInService={isInService}
          />
        );
      case "sparkly":
        return (
          <SparklyArrow
            size={size}
            direction={direction}
            isInService={isInService}
          />
        );
      case "rainbow":
        return (
          <RainbowArrow
            size={size}
            direction={direction}
            isInService={isInService}
          />
        );
      default:
        return (
          <RoundedArrow
            size={size}
            direction={direction}
            isInService={isInService}
          />
        );
    }
  };

  return <View className={cn("absolute", className)}>{renderVariant()}</View>;
};
