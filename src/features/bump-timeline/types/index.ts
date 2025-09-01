export interface Position {
  label: string;
  style?: object; // styling for column appearance
}

export interface Event {
  positionIndex: number; // which terminal/column
  time: Date; // arrival/departure time
  type: "arrival" | "departure";
  label?: string;
  metadata?: object; // for future overlay information
}

export interface VesselLine {
  label: string;
  events: Event[];
  style?: object; // styling for line appearance
}

export interface BumpTimelineChartProps {
  positions: Position[]; // terminals/columns
  vesselLines: VesselLine[][]; // 2D array: vessel -> events
  timeRange: { start: Date; end: Date };
  hourHeight: number; // configurable height per hour
  controlPointOffset: number; // percentage of hour height for curve control
}

// Internal types for component calculations
export interface TimeTick {
  time: Date;
  label: string;
  yPosition: number;
}

export interface PointPosition {
  x: number;
  y: number;
  event: Event;
}

export interface BezierCurve {
  startPoint: PointPosition;
  endPoint: PointPosition;
  controlPoint1: { x: number; y: number };
  controlPoint2: { x: number; y: number };
}
