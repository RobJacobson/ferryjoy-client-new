import type { VesselLocationConvex } from "../../shared/VesselLocation";
import type { DatabaseReader, DatabaseWriter } from "../_generated/server";

/**
 * Insert a vessel location only if it doesn't already exist
 * Checks for duplicates based on vesselID and timeStamp
 */
export async function insertVesselLocationIfNotExists(
  db: DatabaseWriter,
  vesselLocation: VesselLocationConvex
) {
  // Check if a location with the same vessel ID and timestamp already exists
  const existing = await db
    .query("vesselLocations")
    .withIndex("by_vessel_and_timestamp", (q) =>
      q
        .eq("vesselID", vesselLocation.vesselID)
        .eq("timeStamp", vesselLocation.timeStamp)
    )
    .first();

  if (existing) {
    return null; // Already exists, don't insert duplicate
  }

  // Insert the new vessel location
  return await db.insert("vesselLocations", vesselLocation);
}

/**
 * Get the latest vessel location for each vessel
 * Returns a map of vesselID -> latest vessel location
 */
export async function getLatestVesselLocationsByVessel(db: DatabaseReader) {
  // Get all vessel locations ordered by timestamp (descending)
  const allLocations = await db
    .query("vesselLocations")
    .withIndex("by_timestamp")
    .order("desc")
    .collect();

  // Group by vessel ID and take the first (latest) for each vessel
  const latestByVessel = new Map();

  for (const location of allLocations) {
    if (!latestByVessel.has(location.vesselID)) {
      latestByVessel.set(location.vesselID, location);
    }
  }

  return Array.from(latestByVessel.values());
}
