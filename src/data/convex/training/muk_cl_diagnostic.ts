import { api, internal } from "@/data/convex/_generated/api";
import { internalAction } from "@/data/convex/_generated/server";
import type { ConvexVesselTrip } from "@/data/types/convex/VesselTrip";
import { log } from "@/shared/lib/logger";

/**
 * Focused diagnostic for muk-cl route to understand performance degradation
 */
export const mukClDiagnostic = internalAction({
  args: {},
  handler: async (ctx) => {
    log.info("Starting muk-cl route diagnostic");

    // Get all completed vessel trips
    const allTrips: ConvexVesselTrip[] = await ctx.runQuery(
      api.functions.vesselTrips.queries.getCompletedTrips
    );

    // Filter for muk-cl route
    const mukClTrips = allTrips.filter(
      (trip) => trip.OpRouteAbbrev === "muk-cl"
    );
    log.info(`Found ${mukClTrips.length} muk-cl trips`);

    // Analyze each trip with both time normalization approaches
    const analysis = mukClTrips
      .map((trip) => {
        const departureTime = trip.LeftDockActual;
        if (!departureTime) return null;

        const date = new Date(departureTime);

        // Check if this is UTC vs local time
        const utcHours = date.getUTCHours();
        const localHours = date.getHours(); // This will be based on the server's local timezone, which is UTC in Convex

        // To get actual Seattle local time, we need to convert explicitly
        const seattleDate = new Date(
          date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
        );
        const seattleHours = seattleDate.getHours();

        // Minutes since midnight (original approach, using Seattle local time for consistency)
        const minutesSinceMidnight =
          seattleHours * 60 + seattleDate.getMinutes();

        // Minutes since 4:00 AM (new approach, using Seattle local time)
        let minutesSince4AM: number;
        if (seattleHours < 4) {
          minutesSince4AM =
            (seattleHours + 24) * 60 + seattleDate.getMinutes() - 4 * 60;
        } else {
          minutesSince4AM =
            seattleHours * 60 + seattleDate.getMinutes() - 4 * 60;
        }

        return {
          vesselId: trip.VesselID,
          vesselName: trip.VesselName,
          scheduledDeparture: trip.ScheduledDeparture,
          actualDeparture: departureTime,
          localTime: seattleDate.toLocaleString("en-US", {
            timeZone: "America/Los_Angeles",
          }),
          utcTime: date.toISOString(),
          localHour: seattleHours, // Use Seattle local hour for analysis
          utcHour: utcHours,
          minutesSinceMidnight,
          minutesSince4AM,
          // Check if this trip would be affected by the 4 AM baseline (in Seattle local time)
          crossesMidnight: seattleHours < 4,
          // Check if this is during peak hours in Seattle
          isPeakHour:
            (seattleHours >= 6 && seattleHours <= 9) ||
            (seattleHours >= 15 && seattleHours <= 19),
          // Check if this is during late night/early morning (when ferries don't operate)
          isLateNight: seattleHours >= 22 || seattleHours <= 5,
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

    // Find late night trips
    const lateNightTrips = analysis.filter((trip) => trip?.isLateNight);

    // Analyze the distribution of minutes since 4 AM
    const minutesSince4AMValues = analysis
      .map((trip) => trip?.minutesSince4AM)
      .filter((val): val is number => val !== undefined);

    const minMinutes = Math.min(...minutesSince4AMValues);
    const maxMinutes = Math.max(...minutesSince4AMValues);
    const avgMinutes =
      minutesSince4AMValues.reduce((a, b) => a + b, 0) /
      minutesSince4AMValues.length;

    const report = {
      summary: {
        totalTrips: analysis.length,
        midnightCrossers: midnightCrossers.length,
        peakHourTrips: peakHourTrips.length,
        lateNightTrips: lateNightTrips.length,
        midnightCrosserPercentage: (
          (midnightCrossers.length / analysis.length) *
          100
        ).toFixed(1),
        peakHourPercentage: (
          (peakHourTrips.length / analysis.length) *
          100
        ).toFixed(1),
        lateNightPercentage: (
          (lateNightTrips.length / analysis.length) *
          100
        ).toFixed(1),
      },
      timeZoneAnalysis: {
        localHourDistribution: hourDistribution,
        utcHourDistribution: utcHourDistribution,
        timeZoneOffset: new Date().getTimezoneOffset(), // This will be 0 in Convex as it's UTC
        isUsingLocalTime: true, // Indicates we are explicitly converting to local time
      },
      minutesSince4AMAnalysis: {
        min: minMinutes,
        max: maxMinutes,
        average: avgMinutes.toFixed(2),
        range: maxMinutes - minMinutes,
        // Check if there are any extreme outliers
        extremeOutliers: minutesSince4AMValues.filter(
          (val) => val < -1000 || val > 2000
        ).length,
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
        isLateNight: trip?.isLateNight,
      })),
      midnightCrossers: midnightCrossers.slice(0, 5).map((trip) => ({
        vesselId: trip?.vesselId,
        localTime: trip?.localTime,
        utcTime: trip?.utcTime,
        localHour: trip?.localHour,
        minutesSinceMidnight: trip?.minutesSinceMidnight,
        minutesSince4AM: trip?.minutesSince4AM,
      })),
      lateNightTrips: lateNightTrips.slice(0, 5).map((trip) => ({
        vesselId: trip?.vesselId,
        localTime: trip?.localTime,
        utcTime: trip?.utcTime,
        localHour: trip?.localHour,
        minutesSinceMidnight: trip?.minutesSinceMidnight,
        minutesSince4AM: trip?.minutesSince4AM,
      })),
    };

    log.info("muk-cl diagnostic complete");
    return report;
  },
});
