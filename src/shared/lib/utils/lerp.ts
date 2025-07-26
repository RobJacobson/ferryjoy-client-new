/**
 * Linear interpolation function
 * Maps a value from one range to another with optional easing
 */
export function lerp(
  value: number,
  inputStart: number,
  inputEnd: number,
  outputStart: number,
  outputEnd: number,
  easingFn?: (t: number) => number
): number {
  // Normalize input value to 0-1 range
  const t = (value - inputStart) / (inputEnd - inputStart);

  // Clamp t to 0-1 range
  const clampedT = Math.max(0, Math.min(1, t));

  // Apply easing function if provided, otherwise use linear
  const easedT = easingFn ? easingFn(clampedT) : clampedT;

  // Interpolate to output range
  return outputStart + (outputEnd - outputStart) * easedT;
}

/**
 * Easing functions - all take t from 0 to 1 and return eased value from 0 to 1
 */

// Linear (no easing)
export const linear = (t: number): number => t;

// Ease in (slow start)
export const easeIn = (t: number): number => t * t;

// Ease out (slow end)
export const easeOut = (t: number): number => 1 - (1 - t) * (1 - t);

// Ease in out (slow start and end)
export const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

// Ease out in (fast start and end, slow middle)
export const easeOutIn = (t: number): number =>
  t < 0.5 ? 1 - (-2 * t + 1) ** 2 / 2 : 2 * (t - 0.5) * (t - 0.5);

// Smooth step (smoother than easeInOut)
export const smoothStep = (t: number): number => t * t * (3 - 2 * t);

// Exponential ease in
export const easeInExpo = (t: number): number =>
  t === 0 ? 0 : 2 ** (10 * t - 10);

// Exponential ease out
export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - 2 ** (-10 * t);

// Bounce ease out
export const easeOutBounce = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    const adjustedT = t - 1.5 / d1;
    return n1 * adjustedT * adjustedT + 0.75;
  } else if (t < 2.5 / d1) {
    const adjustedT = t - 2.25 / d1;
    return n1 * adjustedT * adjustedT + 0.9375;
  } else {
    const adjustedT = t - 2.625 / d1;
    return n1 * adjustedT * adjustedT + 0.984375;
  }
};
