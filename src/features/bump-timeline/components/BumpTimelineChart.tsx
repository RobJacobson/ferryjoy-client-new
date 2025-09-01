import type React from "react";
import { useState } from "react";
import { View } from "react-native";
import Svg, { G } from "react-native-svg";

import type { BumpTimelineChartProps, TimeTick } from "../types";
import { TimelineAxis } from "./TimelineAxis";

/**
 * Generate time ticks for Y-axis based on time range and hour height
 */
const generateTimeTicks = (
  timeRange: { start: Date; end: Date },
  hourHeight: number
): TimeTick[] => {
  const ticks: TimeTick[] = [];
  const currentTime = new Date(timeRange.start);

  while (currentTime <= timeRange.end) {
    const yPosition =
      ((currentTime.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60)) *
      hourHeight;
    ticks.push({
      time: new Date(currentTime),
      label: currentTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      yPosition,
    });

    currentTime.setHours(currentTime.getHours() + 1);
  }

  return ticks;
};

/**
 * Main component for rendering a bump timeline chart.
 * Displays vessel movements between terminals over time with smooth curved lines.
 */
export const BumpTimelineChart: React.FC<BumpTimelineChartProps> = ({
  positions,
  vesselLines,
  timeRange,
  hourHeight: initialHourHeight,
  controlPointOffset,
}) => {
  // State for zoom functionality (future feature)
  const [hourHeight, setHourHeight] = useState(initialHourHeight);

  // Chart configuration
  const marginLeft = 80; // Space for time labels
  const marginRight = 20; // Right margin
  const chartWidth = 400; // TODO: make configurable or responsive

  // Calculate chart dimensions
  const totalHours =
    (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60);
  const chartHeight = totalHours * hourHeight;

  // Generate time ticks for Y-axis
  const timeTicks = generateTimeTicks(timeRange, hourHeight);

  return (
    <View style={{ flex: 1 }}>
      <Svg width={chartWidth} height={chartHeight}>
        <G>
          <TimelineAxis
            timeTicks={timeTicks}
            chartWidth={chartWidth}
            marginLeft={marginLeft}
            marginRight={marginRight}
            showGridLines={true}
          />
          {/* TODO: TimelineColumn components */}
          {/* TODO: TimelineLine components */}
          {/* TODO: TimelinePoint components */}
        </G>
      </Svg>
    </View>
  );
};
