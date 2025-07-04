import { cronJobs } from "convex/server";

import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetch vessel locations",
  { minutes: 1 }, // Run every minute
  api.vesselLocations.vesselLocationActions.fetchAndStoreVesselLocations
);

crons.interval(
  "fetch vessel locations current",
  { seconds: 5 }, // Run every five seconds
  api.vesselLocationsCurrent.vesselLocationCurrentActions
    .fetchAndUpsertVesselLocationsCurrent
);

export default crons;
