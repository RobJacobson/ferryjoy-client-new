export const log = {
  info: (message: string, ...args: unknown[]) => console.log(message, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(message, ...args),
  error: (message: string, ...args: unknown[]) =>
    console.error(message, ...args),
  debug: (message: string, ...args: unknown[]) => {
    // Only log in development, but don't access process.env during module evaluation
    console.log(message, ...args);
  },
  level: "debug",
} as const;
