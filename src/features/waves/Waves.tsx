import { useId } from "react";
import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

// Types local to this module for clarity
type Point = { x: number; y: number };

// Helpers
const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v;
const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

// Control-point helpers with symmetry at internal points
const baseCpRatio = 0.4;

const controlPointRatio = (dx: number, maxWavelength: number): number =>
  clamp(baseCpRatio * (dx / (maxWavelength / 2)), 0.12, baseCpRatio);

const cpOffset = (dx: number, maxWavelength: number): number =>
  dx * controlPointRatio(dx, maxWavelength);

// Build semi-random alternating points across the width
const generatePoints = (
  width: number,
  maxAmplitude: number,
  maxWavelength: number
): Point[] => {
  const baseline = maxAmplitude;
  const maxHalf = maxWavelength / 2;
  const pickSeg = (): number => Math.max(1, rand(maxHalf / 2, maxHalf));

  const start: Point = { x: 0, y: baseline - rand(0, maxAmplitude) };
  const points: Point[] = [start];

  let x = 0;
  let direction = 1;
  while (x < width) {
    const nextX = x + pickSeg();
    x = nextX > width ? width : nextX;
    points.push({ x, y: baseline + direction * rand(0, maxAmplitude) });
    direction = -direction;
  }
  return points;
};

// Reduce points into an SVG path string using symmetric handles computed on-the-fly
const toPath = (points: Point[], maxWavelength: number): string => {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  const last = points.length - 1;
  for (let i = 0; i < last; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dxCurr = b.x - a.x;
    const offCurr = cpOffset(dxCurr, maxWavelength);
    const offPrev =
      i > 0 ? cpOffset(points[i].x - points[i - 1].x, maxWavelength) : offCurr;
    const offNext =
      i < last - 1
        ? cpOffset(points[i + 2].x - points[i + 1].x, maxWavelength)
        : offCurr;
    let s = (offPrev + offCurr) / 2;
    let e = (offCurr + offNext) / 2;
    const sum = s + e;
    const limit = dxCurr * 0.9;
    if (sum > limit) {
      const scale = limit / sum;
      s *= scale;
      e *= scale;
    }
    d += ` C ${a.x + s} ${a.y}, ${b.x - e} ${b.y}, ${b.x} ${b.y}`;
  }
  return d;
};

export const Waves = ({
  width,
  height,
  maxWavelength,
  maxAmplitude,
  stroke = "red",
  strokeWidth = 1,
}: {
  width: number;
  height: number;
  maxWavelength: number;
  maxAmplitude: number;
  stroke: string;
  strokeWidth: number;
}) => {
  const gradientId = useId();
  const clipId = useId();
  const points = generatePoints(width, maxAmplitude, maxWavelength);
  const path = toPath(points, maxWavelength);
  const last = points[points.length - 1];
  const areaPath = `${path} L ${last.x} ${height} L 0 ${height} Z`;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <ClipPath id={clipId}>
          <Rect x={0} y={0} width={width} height={height} />
        </ClipPath>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
          <Stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <G clipPath={`url(#${clipId})`}>
        <Path d={areaPath} fill={`url(#${gradientId})`} />
        <Path d={path} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
      </G>
    </Svg>
  );
};
