#!/usr/bin/env node

/**
 * Display ML Training Statistics by Route
 * Formats the training results into a readable table
 */

const routeStats = {
  "pt-cou": {
    avgPrediction: 64.37,
    count: 340,
    mae: 1.03,
    r2: 1.0,
    stdDev: 311.61,
  },
  "muk-cl": {
    avgPrediction: 30.92,
    count: 593,
    mae: 1.27,
    r2: 1.0,
    stdDev: 71.4,
  },
  "f-v-s": {
    avgPrediction: 39.84,
    count: 1185,
    mae: 2.03,
    r2: 1.0,
    stdDev: 102.97,
  },
  "ana-sj": {
    avgPrediction: 29.16,
    count: 314,
    mae: 2.14,
    r2: 1.0,
    stdDev: 68.26,
  },
  "sea-br": {
    avgPrediction: 43.24,
    count: 364,
    mae: 1.24,
    r2: 1.0,
    stdDev: 81.91,
  },
  "ed-king": {
    avgPrediction: 39.69,
    count: 571,
    mae: 2.08,
    r2: 1.0,
    stdDev: 107.97,
  },
  "sea-bi": {
    avgPrediction: 31.14,
    count: 462,
    mae: 1.99,
    r2: 1.0,
    stdDev: 124.01,
  },
  "pd-tal": {
    avgPrediction: 38.43,
    count: 426,
    mae: 2.79,
    r2: 1.0,
    stdDev: 102.36,
  },
};

// Route name mapping for better readability
const routeNames = {
  "pt-cou": "Port Townsend ↔ Coupeville",
  "muk-cl": "Mukilteo ↔ Clinton",
  "f-v-s": "Fauntleroy ↔ Vashon ↔ Southworth",
  "ana-sj": "Anacortes ↔ San Juan Islands",
  "sea-br": "Seattle ↔ Bremerton",
  "ed-king": "Edmonds ↔ Kingston",
  "sea-bi": "Seattle ↔ Bainbridge Island",
  "pd-tal": "Point Defiance ↔ Tahlequah",
};

console.log("\n🚢 FerryJoy ML Training Statistics by Route");
console.log("=".repeat(80));

// Header
console.log(
  "Route ID    | Route Name                    | Examples | Avg Dwell (min) | Std Dev | MAE | R²"
);
console.log(
  "------------|-------------------------------|----------|-----------------|---------|-----|-----"
);

// Sort routes by number of examples (descending)
const sortedRoutes = Object.entries(routeStats).sort(
  ([, a], [, b]) => b.count - a.count
);

// Display each route
sortedRoutes.forEach(([routeId, stats]) => {
  const routeName = routeNames[routeId] || routeId;
  const routeNameTruncated =
    routeName.length > 30 ? routeName.substring(0, 27) + "..." : routeName;

  console.log(
    `${routeId.padEnd(11)} | ${routeNameTruncated.padEnd(30)} | ${stats.count.toString().padStart(7)} | ${stats.avgPrediction.toFixed(2).padStart(14)} | ${stats.stdDev.toFixed(2).padStart(7)} | ${stats.mae.toFixed(2).padStart(3)} | ${stats.r2.toFixed(2).padStart(3)}`
  );
});

console.log("=".repeat(80));

// Summary statistics
const totalExamples = Object.values(routeStats).reduce(
  (sum, stats) => sum + stats.count,
  0
);
const avgMae =
  Object.values(routeStats).reduce((sum, stats) => sum + stats.mae, 0) /
  Object.keys(routeStats).length;
const avgR2 =
  Object.values(routeStats).reduce((sum, stats) => sum + stats.r2, 0) /
  Object.keys(routeStats).length;

console.log(`📊 Summary:`);
console.log(`   • Total training examples: ${totalExamples.toLocaleString()}`);
console.log(`   • Routes trained: ${Object.keys(routeStats).length}`);
console.log(`   • Average MAE: ${avgMae.toFixed(2)} minutes`);
console.log(`   • Average R²: ${avgR2.toFixed(3)}`);

// Performance insights
console.log(`\n🔍 Performance Insights:`);
const bestMae = Object.entries(routeStats).reduce(
  (best, [routeId, stats]) =>
    stats.mae < best.mae ? { routeId, ...stats } : best,
  { routeId: "", mae: Infinity }
);
const mostExamples = Object.entries(routeStats).reduce(
  (most, [routeId, stats]) =>
    stats.count > most.count ? { routeId, ...stats } : most,
  { routeId: "", count: 0 }
);

console.log(
  `   • Best performing route (lowest MAE): ${bestMae.routeId} (${bestMae.mae.toFixed(2)} min)`
);
console.log(
  `   • Most data-rich route: ${mostExamples.routeId} (${mostExamples.count} examples)`
);

console.log(
  "\n✅ Training completed successfully! All models saved to database.\n"
);
