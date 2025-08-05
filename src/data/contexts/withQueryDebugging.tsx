import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { useEffect, useRef } from "react";

import { log } from "@/shared/lib/logger";

/**
 * Type for the debugging wrapper function
 */
type QueryDebuggingWrapper = (args: Record<string, unknown>) => unknown;

/**
 * HOC that wraps a Convex query with debugging functionality
 * Measures the size of data received and provides summaries
 */
export const withQueryDebugging = (
  queryFn: FunctionReference<"query">,
  contextName: string
): QueryDebuggingWrapper => {
  return (args: Record<string, unknown>) => {
    const result = useQuery(queryFn, args);
    const lastSizeRef = useRef<number>(0);
    const lastCountRef = useRef<number>(0);

    useEffect(() => {
      if (result === undefined) return;

      const jsonString = JSON.stringify(result);
      const sizeInBytes = new Blob([jsonString]).size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      const itemCount = Array.isArray(result) ? result.length : 1;

      // Only log if the size or count has changed significantly
      const sizeChanged = Math.abs(sizeInBytes - lastSizeRef.current) > 100; // 100 bytes threshold
      const countChanged = itemCount !== lastCountRef.current;

      if (sizeChanged || countChanged) {
        log.info(`${contextName}: Query data received`, {
          itemCount,
          sizeInKB: `${sizeInKB} KB`,
          sizeInBytes,
          timestamp: new Date().toISOString(),
        });

        lastSizeRef.current = sizeInBytes;
        lastCountRef.current = itemCount;
      }
    }, [result, contextName]);

    return result;
  };
};
