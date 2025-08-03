import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "update vessel trips",
  { seconds: 15 }, // every ffteen seconds
  internal.functions.vesselTrips.actions.updateVesselTrips
);

crons.interval(
  "fetch vessel pings",
  { seconds: 30 }, // every thirty seconds
  internal.functions.vesselPings.actions.fetchAndStoreVesselPings
);

// Register a cron job to cleanup old vessel pings every 6 hours
crons.cron(
  "cleanup old vessel pings",
  "0 */6 * * *", // Every 6 hours
  internal.functions.vesselPings.actions.cleanupOldPings
);

export default crons;
