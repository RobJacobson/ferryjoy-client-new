import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

// Register a cron job to run every minute at 00 seconds
crons.cron(
  "fetch vessel locations",
  "* * * * *",
  internal.functions.vessels.actions.fetchAndStoreVesselLocations
);

export default crons;
