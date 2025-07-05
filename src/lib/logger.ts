import { logger } from "react-native-logs";

// Create logger instance with simple configuration
const log = logger.createLogger({
  severity: __DEV__ ? "debug" : "error",
  async: true,
  dateFormat: "time",
  printLevel: true,
  printDate: true,
  enabled: true,
});

export default log;
