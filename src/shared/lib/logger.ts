const isDevelopment = process.env.NODE_ENV === "development";

export const log = {
  info: (message: string, ...args: any[]) => console.log(message, ...args),
  warn: (message: string, ...args: any[]) => console.warn(message, ...args),
  error: (message: string, ...args: any[]) => console.error(message, ...args),
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
  level: isDevelopment ? "debug" : "error",
} as const;
