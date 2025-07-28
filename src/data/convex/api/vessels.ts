import { ConvexHttpClient } from "convex/browser";
import { type VesselLocation, WsfVessels } from "ws-dottie";

import { api } from "@/data/convex/_generated/api";
import { toConvex } from "@/data/convex/utils";
import { log } from "@/shared/lib/logger";

/**
 * Get all vessel basics from WSF API
 */
export const getVesselBasics = async () => {
  return await WsfVessels.getVesselBasics();
};

/**
 * Get vessel basics by ID from WSF API
 */
export const getVesselBasicsById = async (vesselId: number) => {
  return await WsfVessels.getVesselBasicsById({ vesselId });
};

/**
 * Get vessel accommodations from WSF API
 */
export const getVesselAccommodations = async () => {
  return await WsfVessels.getVesselAccommodations();
};

/**
 * Get vessel statistics from WSF API
 */
export const getVesselStats = async () => {
  return await WsfVessels.getVesselStats();
};
