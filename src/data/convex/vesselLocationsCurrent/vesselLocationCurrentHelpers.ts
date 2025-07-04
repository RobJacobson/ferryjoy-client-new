import type { VesselLocationConvex } from "../../shared/VesselLocation";
import type { DatabaseReader, DatabaseWriter } from "../_generated/server";

/**
 * Upsert a vessel location to the current locations table
 * Ensures only one entry per vessel by replacing existing entries
 * Only updates if the new vessel location has a newer or equal timestamp
 */
export async function upsertVesselLocationCurrent(
  db: DatabaseWriter,
  vesselLocation: VesselLocationConvex
) {
  // Check if a current location for this vessel already exists
  const existing = await db
    .query("vesselLocationsCurrent")
    .withIndex("by_vessel_id", (q) => q.eq("vesselID", vesselLocation.vesselID))
    .first();

  if (existing) {
    // Only update if the new timestamp is newer than or equal to the existing one
    if (vesselLocation.timeStamp > existing.timeStamp) {
      await db.replace(existing._id, vesselLocation);
      // Return the ID to indicate successful update (for counting purposes)
      return existing._id;
    } else {
      // Return null to indicate no update was made (existing data is newer)
      return null;
    }
  } else {
    // Insert a new record
    console.log(`Inserting new vessel ${vesselLocation.vesselID}`);
    return await db.insert("vesselLocationsCurrent", vesselLocation);
  }
}

/**
 * Get all current vessel locations
 */
export async function getAllCurrentVesselLocations(db: DatabaseReader) {
  return await db.query("vesselLocationsCurrent").collect();
}

/**
 * Get current vessel location by vessel ID
 */
export async function getCurrentVesselLocationByID(
  db: DatabaseReader,
  vesselID: number
) {
  return await db
    .query("vesselLocationsCurrent")
    .withIndex("by_vessel_id", (q) => q.eq("vesselID", vesselID))
    .first();
}
