import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "clear messages table",
  { seconds: 15 }, // every minute
  internal.functions.vesselTrips.actions.updateVesselTrips
);

crons.cron(
  "fetch vessel pings",
  "* * * * *",
  internal.functions.vesselPings.actions.fetchAndStoreVesselPings
);

// Register a cron job to run daily at 2 AM to update vessel basics
crons.cron(
  "update vessel basics",
  "0 2 * * *",
  internal.functions.vesselBasics.actions.updateVesselBasics
);

export default crons;
