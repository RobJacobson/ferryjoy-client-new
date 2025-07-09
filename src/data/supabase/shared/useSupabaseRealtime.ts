// Shared hook factory for Supabase real-time data

import { useEffect, useState } from "react";

import log from "@/lib/logger";

import { supabase } from "../client";
import { getStartTime, logDataSize } from "./utils";

type Key = string | number | symbol;

/**
 * Configuration for creating a Supabase real-time hook
 */
export interface SupabaseHookConfig<T, Args extends unknown[] = []> {
  // Data fetching
  fetchData: (startTime: Date, ...args: Args) => Promise<T[]>;
  keyExtractor: (item: T) => string | number;

  // Real-time subscription
  realtime: {
    tableName: string;
    filterField: string;
    channelName: string;
  };

  // Data transformation
  toDomainModel: (payload: Record<string, unknown>) => T;

  // Optional dependencies for the hook
  dependencies?: unknown[];
}

/**
 * Hook factory function for creating Supabase real-time hooks with the given configuration
 */
export function createSupabaseHook<
  T extends { id: number },
  Args extends unknown[] = [],
>(config: SupabaseHookConfig<T, Args>) {
  return (...args: Args) => {
    const [data, setData] = useState<Record<string | number, T[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: deps are not needed
    useEffect(() => {
      if (!supabase) {
        setError("Supabase not configured");
        setLoading(false);
        return;
      }

      const startTime = getStartTime();
      log.info(
        `Fetching ${config.realtime.tableName} from ${startTime.toISOString()}`
      );

      // Load initial data
      const loadData = async () => {
        try {
          const items = await config.fetchData(startTime, ...args);
          const dataMap = arrayToMap(items, config.keyExtractor);
          setData(dataMap);
          logDataSize(
            `Fetched ${items.length} ${config.realtime.tableName}`,
            items
          );
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          log.error(`Error fetching ${config.realtime.tableName}:`, err);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      loadData();

      // Set up real-time subscription
      const channel = supabase
        .channel(config.realtime.channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: config.realtime.tableName,
            filter: `${config.realtime.filterField}=gte.${startTime.toISOString()}`,
          },
          (payload) => {
            log.debug(`${config.realtime.tableName} change:`, payload);

            const item = config.toDomainModel(
              payload.new as Record<string, unknown>
            );
            logDataSize(
              `Received ${payload.eventType} ${config.realtime.tableName} update`,
              payload.new
            );
            setData((prev) =>
              handleItemChange(
                prev,
                config.keyExtractor(item),
                item,
                payload.eventType
              )
            );
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }, [...(config.dependencies || [])]);
    return { data, loading, error };
  };
}

/**
 * Handle item changes based on event type (INSERT, UPDATE, or DELETE)
 */
const handleItemChange = <T extends { id: number }>(
  map: Record<Key, T[]>,
  key: Key,
  item: T,
  eventType: string
): Record<Key, T[]> => {
  const existing = map[key] || [];

  switch (eventType) {
    case "INSERT":
      return { ...map, [key]: [...existing, item] };
    case "UPDATE":
      return {
        ...map,
        [key]: existing.map((existingItem) =>
          existingItem.id === item.id ? item : existingItem
        ),
      };
    case "DELETE":
      return {
        ...map,
        [key]: existing.filter((existingItem) => existingItem.id !== item.id),
      };
    default:
      return map;
  }
};

/**
 * Create a map from an array of items grouped by key
 */
const arrayToMap = <T>(
  items: T[],
  keyExtractor: (item: T) => Key
): Record<Key, T[]> =>
  items.reduce(
    (map, item) => {
      const key = keyExtractor(item);
      return {
        ...map,
        [key]: [...(map[key] || []), item],
      };
    },
    {} as Record<Key, T[]>
  );
