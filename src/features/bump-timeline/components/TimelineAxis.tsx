import React from "react";
import { Text } from "react-native";
import { Line, Text as SvgText } from "react-native-svg";

import type { TimeTick } from "../types";

interface TimelineAxisProps {
  timeTicks: TimeTick[];
  chartWidth: number;
  marginLeft: number;
  marginRight: number;
  showGridLines?: boolean;
}

/**
 * Renders the time axis (Y-axis) with hour ticks, labels, and optional grid lines
 */
export const TimelineAxis: React.FC<TimelineAxisProps> = ({
  timeTicks,
  chartWidth,
  marginLeft,
  marginRight,
  showGridLines = true,
}) => {
  const axisWidth = chartWidth - marginLeft - marginRight;
  const labelWidth = 60; // Width reserved for time labels
  const tickLength = 8; // Length of tick marks

  return (
    <>
      {/* Time axis line */}
      <Line
        x1={marginLeft}
        y1={0}
        x2={marginLeft}
        y2={timeTicks[timeTicks.length - 1]?.yPosition || 0}
        stroke="#666"
        strokeWidth={1}
      />

      {/* Time ticks and labels */}
      {timeTicks.map((tick, index) => (
        <React.Fragment key={index}>
          {/* Tick mark */}
          <Line
            x1={marginLeft - tickLength}
            y1={tick.yPosition}
            x2={marginLeft}
            y2={tick.yPosition}
            stroke="#666"
            strokeWidth={1}
          />

          {/* Time label */}
          <SvgText
            x={marginLeft - tickLength - 5}
            y={tick.yPosition + 4}
            fontSize={12}
            fill="#666"
            textAnchor="end"
            alignmentBaseline="middle"
          >
            {tick.label}
          </SvgText>

          {/* Optional grid line */}
          {showGridLines && (
            <Line
              x1={marginLeft}
              y1={tick.yPosition}
              x2={marginLeft + axisWidth}
              y2={tick.yPosition}
              stroke="#e0e0e0"
              strokeWidth={0.5}
              strokeDasharray="2,2"
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};
