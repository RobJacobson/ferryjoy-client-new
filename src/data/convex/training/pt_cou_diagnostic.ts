import { api, internal } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

/**
 * Focused diagnostic for pt-cou route to understand time normalization differences
 */
export const ptCouDiagnostic = internalAction({
  args: {},
  handler: async (ctx) => {
    log.info("Starting pt-cou route diagnostic");

    // Get all completed vessel trips
    const allTrips: ConvexVesselTrip[] = await ctx.runQuery(
      api.functions.vesselTrips.queries.getCompletedTrips
    );

    // Filter for pt-cou route
    const ptCouTrips = allTrips.filter(
      (trip) => trip.OpRouteAbbrev === "pt-cou"
    );
    log.info(`Found ${ptCouTrips.length} pt-cou trips`);

    // Analyze each trip with both time normalization approaches
    const analysis = ptCouTrips
      .map((trip) => {
        const departureTime = trip.LeftDockActual;
        if (!departureTime) return null;

        const date = new Date(departureTime);

        // Check if this is UTC vs local time
        const utcHours = date.getUTCHours();
        const localHours = date.getHours();

        // Minutes since midnight (original approach)
        const minutesSinceMidnight = localHours * 60 + date.getMinutes();

        // Minutes since 4:00 AM (new approach)
        let minutesSince4AM: number;
        if (localHours < 4) {
          minutesSince4AM = (localHours + 24) * 60 + date.getMinutes() - 4 * 60;
        } else {
          minutesSince4AM = localHours * 60 + date.getMinutes() - 4 * 60;
        }

        return {
          vesselId: trip.VesselID,
          vesselName: trip.VesselName,
          scheduledDeparture: trip.ScheduledDeparture,
          actualDeparture: departureTime,
          localTime: date.toLocaleString("en-US", {
            timeZone: "America/Los_Angeles",
          }),
          utcTime: date.toISOString(),
          localHour: localHours,
          utcHour: utcHours,
          minutesSinceMidnight,
          minutesSince4AM,
          // Check if this trip would be affected by the 4 AM baseline
          crossesMidnight: localHours < 4,
          // Check if this is during peak hours in Seattle
          isPeakHour:
            (localHours >= 6 && localHours <= 9) ||
            (localHours >= 15 && localHours <= 19),
        };
      })
      .filter(Boolean);

    // Group by hour to see distribution
    const hourDistribution = new Array(24).fill(0);
    const utcHourDistribution = new Array(24).fill(0);

    analysis.forEach((trip) => {
      if (trip) {
        hourDistribution[trip.localHour]++;
        utcHourDistribution[trip.utcHour]++;
      }
    });

    // Find trips that cross midnight
    const midnightCrossers = analysis.filter((trip) => trip?.crossesMidnight);

    // Find trips during peak hours
    const peakHourTrips = analysis.filter((trip) => trip?.isPeakHour);

    const report = {
      summary: {
        totalTrips: analysis.length,
        midnightCrossers: midnightCrossers.length,
        peakHourTrips: peakHourTrips.length,
        midnightCrosserPercentage: (
          (midnightCrossers.length / analysis.length) *
          100
        ).toFixed(1),
        peakHourPercentage: (
          (peakHourTrips.length / analysis.length) *
          100
        ).toFixed(1),
      },
      timeZoneAnalysis: {
        localHourDistribution: hourDistribution,
        utcHourDistribution: utcHourDistribution,
        timeZoneOffset: new Date().getTimezoneOffset(),
        isUsingLocalTime: true,
      },
      sampleTrips: analysis.slice(0, 10).map((trip) => ({
        vesselId: trip?.vesselId,
        localTime: trip?.localTime,
        utcTime: trip?.utcTime,
        localHour: trip?.localHour,
        utcHour: trip?.utcHour,
        minutesSinceMidnight: trip?.minutesSinceMidnight,
        minutesSince4AM: trip?.minutesSince4AM,
        crossesMidnight: trip?.crossesMidnight,
        isPeakHour: trip?.isPeakHour,
      })),
      midnightCrossers: midnightCrossers.slice(0, 5).map((trip) => ({
        vesselId: trip?.vesselId,
        localTime: trip?.localTime,
        utcTime: trip?.utcTime,
        localHour: trip?.localHour,
        minutesSinceMidnight: trip?.minutesSinceMidnight,
        minutesSince4AM: trip?.minutesSince4AM,
      })),
    };

    log.info("pt-cou diagnostic complete");
    return report;
  },
});
