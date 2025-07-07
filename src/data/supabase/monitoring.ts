import log from "@/lib/logger";

import type { Tables } from "./database.types";

/**
 * Data usage statistics for monitoring Supabase downloads
 */
export interface DataUsageStats {
  totalBytes: number;
  totalRecords: number;
  requests: number;
  tables: {
    [tableName: string]: {
      bytes: number;
      records: number;
      requests: number;
      lastFetch: Date;
    };
  };
}

/**
 * Type for Supabase table data - union of all table row types
 */
export type SupabaseTableData =
  | Tables<"vessel_location_current">[]
  | Tables<"vessel_location_minute">[]
  | Tables<"vessel_location_second">[]
  | Tables<"vessel_trip">[];

/**
 * Type for real-time event data
 */
export type RealtimeEventData =
  | Tables<"vessel_location_current">
  | Tables<"vessel_location_minute">
  | Tables<"vessel_location_second">
  | Tables<"vessel_trip">
  | null;

/**
 * Internal state for data monitoring
 */
interface MonitoringState {
  totalBytes: number;
  totalRecords: number;
  requests: number;
  tables: {
    [tableName: string]: {
      bytes: number;
      records: number;
      requests: number;
      lastFetch: Date;
    };
  };
  startTime: number;
}

// Private state using closure
let monitoringState: MonitoringState = {
  totalBytes: 0,
  totalRecords: 0,
  requests: 0,
  tables: {},
  startTime: Date.now(),
};

/**
 * Calculate approximate byte size of a data object
 */
const calculateDataSize = (
  data: SupabaseTableData | RealtimeEventData
): number => {
  try {
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  } catch (error) {
    log.warn("Failed to calculate data size:", error);
    return 0;
  }
};

/**
 * Format bytes into human-readable format
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

/**
 * Update table-specific statistics
 */
const updateTableStats = (
  tableName: string,
  bytes: number,
  records: number
): void => {
  if (!monitoringState.tables[tableName]) {
    monitoringState.tables[tableName] = {
      bytes: 0,
      records: 0,
      requests: 0,
      lastFetch: new Date(),
    };
  }

  monitoringState.tables[tableName].bytes += bytes;
  monitoringState.tables[tableName].records += records;
  monitoringState.tables[tableName].requests += 1;
  monitoringState.tables[tableName].lastFetch = new Date();
};

/**
 * Log a comprehensive summary of data usage
 */
const logSummary = (): void => {
  const runtime = Date.now() - monitoringState.startTime;
  const runtimeMinutes = Math.round((runtime / 60000) * 100) / 100;

  log.info("📈 Data Usage Summary", {
    runtime: `${runtimeMinutes} minutes`,
    totalRequests: monitoringState.requests,
    totalRecords: monitoringState.totalRecords,
    totalData: formatBytes(monitoringState.totalBytes),
    averageRecordsPerRequest: Math.round(
      monitoringState.totalRecords / monitoringState.requests
    ),
    averageBytesPerRequest: formatBytes(
      Math.round(monitoringState.totalBytes / monitoringState.requests)
    ),
    tables: Object.keys(monitoringState.tables).length,
  });

  // Log per-table breakdown
  Object.entries(monitoringState.tables).forEach(([tableName, tableStats]) => {
    log.info(`  📋 ${tableName}:`, {
      requests: tableStats.requests,
      records: tableStats.records,
      data: formatBytes(tableStats.bytes),
      lastFetch: tableStats.lastFetch.toLocaleTimeString(),
    });
  });
};

/**
 * Record a data fetch operation
 */
export const recordFetch = (
  tableName: string,
  data: SupabaseTableData,
  responseTime?: number
): void => {
  const bytes = calculateDataSize(data);
  const records = data.length;

  // Update total stats
  monitoringState.totalBytes += bytes;
  monitoringState.totalRecords += records;
  monitoringState.requests += 1;

  // Update table-specific stats
  updateTableStats(tableName, bytes, records);

  // Log the fetch operation
  const responseTimeStr = responseTime ? ` (${responseTime}ms)` : "";
  log.info(`📊 Data fetch: ${tableName}`, {
    records,
    bytes: formatBytes(bytes),
    totalRecords: monitoringState.tables[tableName].records,
    totalBytes: formatBytes(monitoringState.tables[tableName].bytes),
    requests: monitoringState.tables[tableName].requests,
    responseTime: responseTimeStr,
  });

  // Log summary every 10 requests
  if (monitoringState.requests % 10 === 0) {
    logSummary();
  }
};

/**
 * Record a real-time subscription event
 */
export const recordRealtimeEvent = (
  tableName: string,
  eventType: string,
  data?: RealtimeEventData
): void => {
  const bytes = data ? calculateDataSize(data) : 0;

  log.debug(`🔄 Realtime event: ${tableName}`, {
    eventType,
    bytes: formatBytes(bytes),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get current statistics
 */
export const getStats = (): DataUsageStats => {
  return { ...monitoringState };
};

/**
 * Reset statistics
 */
export const resetStats = (): void => {
  monitoringState = {
    totalBytes: 0,
    totalRecords: 0,
    requests: 0,
    tables: {},
    startTime: Date.now(),
  };
  log.info("🔄 Data monitoring statistics reset");
};

/**
 * Log current summary to console
 */
export const logCurrentSummary = (): void => {
  logSummary();
};

// Export a legacy object for backward compatibility (if needed)
export const dataMonitor = {
  recordFetch,
  recordRealtimeEvent,
  getStats,
  reset: resetStats,
  logSummary: logCurrentSummary,
};
