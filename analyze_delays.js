#!/usr/bin/env node

// Simple script to analyze vessel trip delays from the training output
// This helps identify data quality issues with negative delays

const sampleTrips = [
  {
    route: "sea-bi",
    scheduled: 1755409200000, // 2025-01-16 10:00:00 UTC
    actual: 1755406926000, // 2025-01-16 09:22:06 UTC
    delay: -37.9, // minutes (negative = early departure)
  },
  {
    route: "pt-cou",
    scheduled: 1755406800000, // 2025-01-16 09:00:00 UTC
    actual: 1755406860000, // 2025-01-16 09:01:00 UTC
    delay: 1.0, // minutes (positive = late departure)
  },
  {
    route: "muk-cl",
    scheduled: 1755406800000, // 2025-01-16 09:00:00 UTC
    actual: 1755408145000, // 2025-01-16 09:29:05 UTC
    delay: 29.1, // minutes (positive = late departure)
  },
  {
    route: "sea-br",
    scheduled: 1755403500000, // 2025-01-16 08:25:00 UTC
    actual: 1755405193000, // 2025-01-16 08:46:33 UTC
    delay: 21.6, // minutes (positive = late departure)
  },
];

console.log("Sample Trip Delay Analysis:");
console.log("===========================");

sampleTrips.forEach((trip, index) => {
  const scheduledDate = new Date(trip.scheduled);
  const actualDate = new Date(trip.actual);

  console.log(`\n${index + 1}. Route: ${trip.route}`);
  console.log(`   Scheduled: ${scheduledDate.toISOString()}`);
  console.log(`   Actual:    ${actualDate.toISOString()}`);
  console.log(`   Delay:     ${trip.delay} minutes`);

  if (trip.delay < -5) {
    console.log(`   ⚠️  SIGNIFICANT NEGATIVE DELAY - Data quality issue!`);
  } else if (trip.delay < 0) {
    console.log(`   ℹ️  Minor early departure (within normal range)`);
  } else {
    console.log(`   ✅ Normal delay`);
  }
});

console.log("\n" + "=".repeat(50));
console.log("Analysis:");
console.log(
  "- Negative delays indicate vessels departed earlier than scheduled"
);
console.log("- Delays > -5 minutes may indicate data quality issues");
console.log(
  "- Early departures of 1-2 minutes could be normal (loading efficiency)"
);
console.log("- Early departures > 5 minutes likely indicate timestamp errors");
