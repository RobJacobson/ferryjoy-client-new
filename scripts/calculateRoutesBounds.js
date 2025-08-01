// Script to calculate route bounds and terminal information
const routes = require("../assets/wsdot/routes.json");
const terminalLocations = require("../assets/wsdot/terminalLocationsFiltered.json");

/**
 * Calculate bounding box from an array of coordinates
 * @param {Array} coordinates - Array of {longitude, latitude} objects
 * @returns {Object} Bounding box with min/max coordinates
 */
const calculateBoundingBox = (coordinates) => {
  if (coordinates.length === 0) {
    throw new Error(
      "Cannot calculate bounding box for empty coordinates array"
    );
  }

  const lngs = coordinates.map((coord) => coord.longitude);
  const lats = coordinates.map((coord) => coord.latitude);

  return {
    minLongitude: Math.min(...lngs),
    maxLongitude: Math.max(...lngs),
    minLatitude: Math.min(...lats),
    maxLatitude: Math.max(...lats),
  };
};

/**
 * Get terminal information by terminal ID
 * @param {number} terminalId - Terminal ID to look up
 * @returns {Object|null} Terminal information or null if not found
 */
const getTerminalById = (terminalId) =>
  terminalLocations.find((terminal) => terminal.TerminalID === terminalId) ||
  null;

/**
 * Process routes and calculate bounds
 */
const calculateRoutesBounds = () => {
  console.log("Processing routes and calculating bounds...\n");

  // Create a map of terminal ID to terminal info for quick lookup
  const terminalMap = Object.fromEntries(
    terminalLocations.map((terminal) => [terminal.TerminalID, terminal])
  );

  // Create all-terminals route data
  const allTerminalsRoute = {
    RouteID: 0,
    RouteAbbrev: "all-terminals",
    Description: "All Terminals",
    RegionID: 0,
    ServiceDisruptions: [],
    Terminals: terminalLocations.map((terminal) => terminal.TerminalID),
  };

  // Combine regular routes with all-terminals route
  const allRoutes = [...routes, allTerminalsRoute];

  // Process each route
  const routesData = allRoutes
    .map((route) => {
      console.log(
        `Processing route: ${route.RouteAbbrev} (${route.Description})`
      );

      // Get terminal information for this route
      const routeTerminals = route.Terminals.map((terminalId) => {
        const terminal = terminalMap[terminalId];
        if (!terminal) {
          console.warn(
            `Warning: Terminal ID ${terminalId} not found for route ${route.RouteAbbrev}`
          );
          return null;
        }

        return {
          terminalAbbrev: terminal.TerminalAbbrev,
          longitude: terminal.Longitude,
          latitude: terminal.Latitude,
        };
      }).filter((terminal) => terminal !== null);

      if (routeTerminals.length === 0) {
        console.warn(
          `Warning: No valid terminals found for route ${route.RouteAbbrev}`
        );
        return null;
      }

      // Calculate bounding box for this route
      const boundingBox = calculateBoundingBox(routeTerminals);

      return {
        routeAbbrev: route.RouteAbbrev,
        routeDescription: route.Description,
        terminals: routeTerminals,
        boundingBox: boundingBox,
      };
    })
    .filter((route) => route !== null);

  // Create the final output structure
  const output = {
    routes: routesData,
    allTerminals: {
      terminals: terminalLocations.map((terminal) => ({
        terminalAbbrev: terminal.TerminalAbbrev,
        longitude: terminal.Longitude,
        latitude: terminal.Latitude,
      })),
      boundingBox: routesData.find(
        (route) => route.routeAbbrev === "all-terminals"
      )?.boundingBox,
    },
    metadata: {
      totalRoutes: routesData.length,
      totalTerminals: terminalLocations.length,
      generatedAt: new Date().toISOString(),
    },
  };

  return output;
};

/**
 * Save data to JSON file
 * @param {Object} data - Data to save
 * @param {string} filename - Output filename
 */
const saveToJson = (data, filename) => {
  const fs = require("node:fs");
  const path = require("node:path");

  try {
    const outputPath = path.join(__dirname, "..", filename);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\n✅ Successfully saved to: ${outputPath}`);
  } catch (error) {
    console.error(`\n❌ Error saving file: ${error.message}`);
    throw error;
  }
};

// Main execution
try {
  console.log("🚢 FerryJoy Route Bounds Calculator\n");
  console.log("=".repeat(50));

  const routesViewData = calculateRoutesBounds();

  console.log(`\n${"=".repeat(50)}`);
  console.log("SUMMARY:");
  console.log(
    `- Total routes processed: ${routesViewData.metadata.totalRoutes - 1} (plus all-terminals)`
  );
  console.log(`- Total terminals: ${routesViewData.metadata.totalTerminals}`);
  console.log(`- All terminals bounding box:`);
  console.log(
    `  Longitude: ${routesViewData.allTerminals.boundingBox.minLongitude.toFixed(6)} to ${routesViewData.allTerminals.boundingBox.maxLongitude.toFixed(6)}`
  );
  console.log(
    `  Latitude: ${routesViewData.allTerminals.boundingBox.minLatitude.toFixed(6)} to ${routesViewData.allTerminals.boundingBox.maxLatitude.toFixed(6)}`
  );

  saveToJson(routesViewData, "assets/wsdot/routesBoundingBoxes.json");

  console.log("\n🎉 Route bounds calculation completed successfully!");
} catch (error) {
  console.error("\n💥 Error during calculation:", error.message);
  process.exit(1);
}
