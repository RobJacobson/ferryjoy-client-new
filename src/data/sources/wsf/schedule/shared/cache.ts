// Schedule-specific caching utilities with AsyncStorage

import AsyncStorage from "@react-native-async-storage/async-storage";

import log from "@/lib/logger";

/**
 * Cache entry with TTL (Time To Live)
 */
export type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

/**
 * Cache strategy configuration
 */
export type CacheStrategy = {
  memory: {
    ttl: number; // Short TTL for memory cache
    maxSize: number;
  };
  storage: {
    ttl: number; // Long TTL for AsyncStorage
    key: string;
  } | null;
};

/**
 * Predefined cache strategies for different data types
 */
export const CACHE_STRATEGIES = {
  vesselPositions: { memory: { ttl: 30000, maxSize: 50 }, storage: null }, // 30s, no storage
  vesselDetails: {
    memory: { ttl: 300000, maxSize: 100 },
    storage: { ttl: 86400000, key: "vessel-details" },
  }, // 5min memory, 24h storage
  schedules: {
    memory: { ttl: 600000, maxSize: 200 },
    storage: { ttl: 3600000, key: "schedules" },
  }, // 10min memory, 1h storage
  routes: {
    memory: { ttl: 300000, maxSize: 50 },
    storage: { ttl: 86400000, key: "routes" },
  }, // 5min memory, 24h storage
  terminals: {
    memory: { ttl: 300000, maxSize: 50 },
    storage: { ttl: 86400000, key: "terminals" },
  }, // 5min memory, 24h storage
  infrastructure: {
    memory: { ttl: 300000, maxSize: 20 },
    storage: { ttl: 86400000, key: "infrastructure" },
  }, // 5min memory, 24h storage
} as const;

/**
 * Memory cache for storing data in memory
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global memory cache instance
const memoryCache = new MemoryCache();

/**
 * Generates a cache key for schedule data
 */
export const generateCacheKey = (
  endpoint: string,
  params?: Record<string, unknown>
): string => {
  if (!params) return `schedule:${endpoint}`;

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return `schedule:${endpoint}:${sortedParams}`;
};

/**
 * Checks if data is expired based on TTL
 */
const isExpired = (timestamp: number, ttl: number): boolean => {
  return Date.now() - timestamp > ttl;
};

/**
 * Retrieves data from cache (memory first, then storage)
 */
export const getFromCache = async <T>(
  key: string,
  strategy: CacheStrategy
): Promise<T | null> => {
  try {
    // Check memory cache first
    const memoryData = memoryCache.get<T>(key);
    if (memoryData !== null) {
      return memoryData;
    }

    // Check AsyncStorage if configured
    if (strategy.storage) {
      const storageKey = `${strategy.storage.key}:${key}`;
      const storedData = await AsyncStorage.getItem(storageKey);

      if (storedData) {
        const entry: CacheEntry<T> = JSON.parse(storedData);

        // Check if storage entry has expired
        if (isExpired(entry.timestamp, strategy.storage.ttl)) {
          await AsyncStorage.removeItem(storageKey);
          return null;
        }

        // Store in memory cache for faster access
        memoryCache.set(key, entry.data, strategy.memory.ttl);
        return entry.data;
      }
    }

    return null;
  } catch (error) {
    log.error(`Cache retrieval failed for key ${key}:`, error);
    return null;
  }
};

/**
 * Stores data in cache (memory and storage)
 */
export const setCache = async <T>(
  key: string,
  data: T,
  strategy: CacheStrategy
): Promise<void> => {
  try {
    // Store in memory cache
    memoryCache.set(key, data, strategy.memory.ttl);

    // Store in AsyncStorage if configured
    if (strategy.storage) {
      const storageKey = `${strategy.storage.key}:${key}`;
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: strategy.storage.ttl,
      };

      await AsyncStorage.setItem(storageKey, JSON.stringify(entry));
    }
  } catch (error) {
    log.error(`Cache storage failed for key ${key}:`, error);
  }
};

/**
 * Clears all cache data
 */
export const clearCache = async (): Promise<void> => {
  try {
    // Clear memory cache
    memoryCache.clear();

    // Clear AsyncStorage cache keys
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(
      (key: string) =>
        key.startsWith("vessel-details:") ||
        key.startsWith("schedules:") ||
        key.startsWith("routes:") ||
        key.startsWith("terminals:") ||
        key.startsWith("infrastructure:")
    );

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    log.error("Cache clearing failed:", error);
  }
};

/**
 * Gets cache statistics for debugging
 */
export const getCacheStats = (): { memorySize: number } => {
  return {
    memorySize: memoryCache.size(),
  };
};
