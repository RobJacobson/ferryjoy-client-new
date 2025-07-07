import { useEffect, useState } from "react";

import type { DataUsageStats } from "../monitoring";
import { getStats, logCurrentSummary, resetStats } from "../monitoring";

/**
 * Hook to access data monitoring functionality
 * Provides access to statistics and monitoring controls
 */
export const useDataMonitoring = () => {
  const [stats, setStats] = useState<DataUsageStats | null>(null);

  // Update stats every 10 seconds
  useEffect(() => {
    const updateStats = () => {
      setStats(getStats());
    };

    updateStats(); // Initial update
    const interval = setInterval(updateStats, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    logSummary: logCurrentSummary,
    reset: () => {
      resetStats();
      setStats(getStats());
    },
    getStats,
  };
};
