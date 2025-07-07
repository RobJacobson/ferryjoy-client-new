import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import log from "@/lib/logger";

import { isSupabaseConfigured, supabase } from "./client";
import type { Tables } from "./database.types";

/**
 * Available table names from the database schema
 */
type TableName =
  | "vessel_location_current"
  | "vessel_location_minute"
  | "vessel_location_second"
  | "vessel_trip";

/**
 * Simple monitoring configuration
 */
interface MonitoringConfig {
  tableName: TableName;
  queryKey: readonly string[];
  logPerformance?: boolean;
  logRealtime?: boolean;
}

/**
 * Performance metrics for monitoring
 */
interface PerformanceMetrics {
  duration: number;
  records: number;
  size: number;
  success: boolean;
  error?: string;
}

/**
 * Real-time event payload from Supabase
 */
interface RealtimePayload<T = unknown> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T | null;
  old: T | null;
  schema: string;
  table: string;
  commit_timestamp: string;
}

/**
 * Simple performance monitoring wrapper
 * T: Arguments tuple type
 * R: Return type (must be an array for proper monitoring)
 */
export const withMonitoring = <
  T extends readonly unknown[],
  R extends readonly unknown[],
>(
  operation: (...args: T) => Promise<R>,
  tableName: string
): ((...args: T) => Promise<R>) => {
  return async (...args: T): Promise<R> => {
    const start = Date.now();

    try {
      const result = await operation(...args);
      const duration = Date.now() - start;

      const metrics: PerformanceMetrics = {
        duration,
        records: result.length,
        size: JSON.stringify(result).length,
        success: true,
      };

      log.info(`📊 ${tableName} fetch`, {
        duration: `${metrics.duration}ms`,
        records: metrics.records,
        size: `${metrics.size} bytes`,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      const metrics: PerformanceMetrics = {
        duration,
        records: 0,
        size: 0,
        success: false,
        error: errorMessage,
      };

      log.error(`❌ ${tableName} fetch failed`, {
        duration: `${metrics.duration}ms`,
        error: metrics.error,
      });

      throw error;
    }
  };
};

/**
 * Type-safe real-time hook
 */
export const useRealtime = (config: MonitoringConfig): void => {
  const queryClient = useQueryClient();

  // Memoize the config to prevent unnecessary re-renders
  const memoizedConfig = useMemo(
    () => config,
    [config.tableName, config.logRealtime, config]
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    if (memoizedConfig.logRealtime) {
      log.debug(`🔄 Setting up ${memoizedConfig.tableName} realtime`);
    }

    const channel = supabase
      .channel(`${memoizedConfig.tableName}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: memoizedConfig.tableName,
        },
        (payload: RealtimePayload) => {
          if (memoizedConfig.logRealtime) {
            log.debug(`🔄 ${memoizedConfig.tableName} ${payload.eventType}`, {
              hasData: !!payload.new,
              timestamp: new Date().toISOString(),
            });
          }

          // Invalidate and refetch
          queryClient.invalidateQueries({
            queryKey: memoizedConfig.queryKey,
          });
        }
      )
      .subscribe((status) => {
        if (memoizedConfig.logRealtime) {
          log.info(`${memoizedConfig.tableName} realtime: ${status}`);
        }
      });

    return () => {
      if (supabase) {
        if (memoizedConfig.logRealtime) {
          log.debug(`🔄 Cleaning up ${memoizedConfig.tableName} realtime`);
        }
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient, memoizedConfig]);
};

/**
 * Type-safe hook factory for specific table types
 */
export const createTypedHook = <T extends TableName>(
  tableName: T,
  queryKey: readonly string[]
) => {
  return {
    useRealtime: (logRealtime = true) =>
      useRealtime({
        tableName,
        queryKey,
        logRealtime,
      }),
  };
};

/**
 * Type-safe monitoring wrapper for specific table types
 */
export const withTypedMonitoring = <
  T extends TableName,
  Args extends readonly unknown[],
>(
  operation: (...args: Args) => Promise<Tables<T>[]>,
  tableName: T
): ((...args: Args) => Promise<Tables<T>[]>) => {
  return withMonitoring(operation, tableName);
};
