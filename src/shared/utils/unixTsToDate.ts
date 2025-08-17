// Convert Unix timestamp (milliseconds) to Date
// const predictedDate = new Date(prediction.prediction.predictedTime);
// const scheduledDate = new Date(prediction.prediction.schedDep);

// Format for display
export const unixTsToDate = (ts: number) =>
  new Date(ts).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    hour12: true,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
