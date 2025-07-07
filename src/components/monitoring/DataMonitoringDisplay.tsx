import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import {
  type DataUsageStats,
  getStats,
  logCurrentSummary,
  resetStats,
} from "../../data/supabase/monitoring";

/**
 * Component to display data monitoring statistics
 * Shows data usage, request counts, and performance metrics
 */
export const DataMonitoringDisplay = () => {
  const [stats, setStats] = useState<DataUsageStats | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update stats every 5 seconds
  useEffect(() => {
    const updateStats = () => {
      setStats(getStats());
    };

    updateStats(); // Initial update
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return null;
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString();
  };

  return (
    <View className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row justify-between items-center"
      >
        <Text className="text-lg font-semibold text-gray-800">
          📊 Data Monitoring
        </Text>
        <Text className="text-gray-600">{isExpanded ? "▼" : "▶"}</Text>
      </Pressable>

      {isExpanded && (
        <ScrollView className="mt-4">
          {/* Summary Stats */}
          <View className="bg-white p-3 rounded mb-3">
            <Text className="font-semibold text-gray-800 mb-2">Summary</Text>
            <View className="space-y-1">
              <Text className="text-sm text-gray-600">
                Total Requests: {stats.requests}
              </Text>
              <Text className="text-sm text-gray-600">
                Total Records: {stats.totalRecords.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600">
                Total Data: {formatBytes(stats.totalBytes)}
              </Text>
              <Text className="text-sm text-gray-600">
                Average Records/Request:{" "}
                {stats.requests > 0
                  ? Math.round(stats.totalRecords / stats.requests)
                  : 0}
              </Text>
              <Text className="text-sm text-gray-600">
                Average Data/Request:{" "}
                {stats.requests > 0
                  ? formatBytes(Math.round(stats.totalBytes / stats.requests))
                  : "0 B"}
              </Text>
            </View>
          </View>

          {/* Per-Table Stats */}
          <View className="bg-white p-3 rounded">
            <Text className="font-semibold text-gray-800 mb-2">Per Table</Text>
            {Object.entries(stats.tables).map(([tableName, tableStats]) => (
              <View
                key={tableName}
                className="border-b border-gray-100 py-2 last:border-b-0"
              >
                <Text className="font-medium text-gray-700 mb-1">
                  {tableName}
                </Text>
                <View className="space-y-1">
                  <Text className="text-xs text-gray-500">
                    Requests: {tableStats.requests}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Records: {tableStats.records.toLocaleString()}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Data: {formatBytes(tableStats.bytes)}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Last Fetch: {formatTime(tableStats.lastFetch)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View className="flex-row space-x-2 mt-3">
            <Pressable
              onPress={logCurrentSummary}
              className="bg-blue-500 px-3 py-2 rounded"
            >
              <Text className="text-white text-sm font-medium">
                Log Summary
              </Text>
            </Pressable>
            <Pressable
              onPress={resetStats}
              className="bg-red-500 px-3 py-2 rounded"
            >
              <Text className="text-white text-sm font-medium">
                Reset Stats
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
};
