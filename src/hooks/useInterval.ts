import { useEffect, useRef } from "react";

/**
 * Custom hook for managing intervals with proper cleanup.
 * Automatically clears the interval when the component unmounts or dependencies change.
 *
 * @param callback - Function to execute on each interval
 * @param delay - Interval delay in milliseconds. If null, the interval is paused
 * @param deps - Dependencies array for the callback function
 */
export const useInterval = (
  callback: () => void,
  delay: number | null,
  deps: React.DependencyList = []
) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );
  const savedCallback = useRef(callback);

  // Update the saved callback when it changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    // Don't schedule if no delay is specified
    if (delay === null) {
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, delay);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [delay, ...deps]);

  // Return a function to manually clear the interval
  const clearIntervalManually = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  return { clearInterval: clearIntervalManually };
};
