import { log } from "@/shared/lib/logger";

/**
 * Higher-order function that wraps functions with consistent logging
 * Supports optional success messages returned by the wrapped function
 */
export const withLogging = <
  T extends readonly unknown[],
  R extends { success: boolean; message?: string },
>(
  name: string,
  fn: (...args: T) => Promise<R>
): ((...args: T) => Promise<R>) => {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();

    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;

      if (result.success) {
        const message = result.message ? ` - ${result.message}` : "";
        log.info(`✅ ${name} completed (${duration}ms)${message}`);
      } else {
        log.warn(`⚠️ ${name} completed with warnings (${duration}ms)`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      log.error(`❌ ${name} failed after ${duration}ms:`, error);
      throw error;
    }
  };
};
