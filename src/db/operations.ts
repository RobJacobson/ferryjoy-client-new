import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "./index";
import { type NewTrip, type NewUser, type NewVessel, type NewVesselPosition, trips, users, vesselPositions, vessels } from "./schema";

// User operations
export const userOperations = {
  // Create a new user
  async create(user: NewUser) {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  },

  // Get user by email
  async getByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  // Get user by ID
  async getById(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  // Update user
  async update(id: number, updates: Partial<NewUser>) {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  },

  // Delete user
  async delete(id: number) {
    await db.delete(users).where(eq(users.id, id));
  },
};

// Vessel operations
export const vesselOperations = {
  // Create a new vessel
  async create(vessel: NewVessel) {
    const [newVessel] = await db.insert(vessels).values(vessel).returning();
    return newVessel;
  },

  // Get all vessels
  async getAll() {
    return await db.select().from(vessels).orderBy(desc(vessels.lastUpdated));
  },

  // Get vessel by ID
  async getById(id: number) {
    const [vessel] = await db.select().from(vessels).where(eq(vessels.id, id));
    return vessel;
  },

  // Get vessel by vessel ID (external ID)
  async getByVesselId(vesselId: string) {
    const [vessel] = await db.select().from(vessels).where(eq(vessels.vesselId, vesselId));
    return vessel;
  },

  // Update vessel position
  async updatePosition(vesselId: string, position: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    inService?: boolean;
    atDock?: boolean;
  }) {
    const [updatedVessel] = await db
      .update(vessels)
      .set({
        ...position,
        lastUpdated: new Date(),
      })
      .where(eq(vessels.vesselId, vesselId))
      .returning();
    return updatedVessel;
  },

  // Get vessels in service
  async getInService() {
    return await db.select().from(vessels).where(eq(vessels.inService, true));
  },
};

// Vessel position operations
export const vesselPositionOperations = {
  // Add a new position record
  async addPosition(position: NewVesselPosition) {
    const [newPosition] = await db.insert(vesselPositions).values(position).returning();
    return newPosition;
  },

  // Get position history for a vessel
  async getVesselHistory(vesselId: number, limit = 100) {
    return await db
      .select()
      .from(vesselPositions)
      .where(eq(vesselPositions.vesselId, vesselId))
      .orderBy(desc(vesselPositions.timestamp))
      .limit(limit);
  },

  // Get positions within a time range
  async getPositionsInRange(vesselId: number, startTime: Date, endTime: Date) {
    return await db
      .select()
      .from(vesselPositions)
      .where(
        and(
          eq(vesselPositions.vesselId, vesselId),
          gte(vesselPositions.timestamp, startTime),
          lte(vesselPositions.timestamp, endTime)
        )
      )
      .orderBy(desc(vesselPositions.timestamp));
  },
};

// Trip operations
export const tripOperations = {
  // Create a new trip
  async create(trip: NewTrip) {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip;
  },

  // Get all trips for a vessel
  async getVesselTrips(vesselId: number) {
    return await db
      .select()
      .from(trips)
      .where(eq(trips.vesselId, vesselId))
      .orderBy(desc(trips.createdAt));
  },

  // Update trip status
  async updateStatus(tripId: number, status: string) {
    const [updatedTrip] = await db
      .update(trips)
      .set({ status, updatedAt: new Date() })
      .where(eq(trips.id, tripId))
      .returning();
    return updatedTrip;
  },

  // Get active trips
  async getActiveTrips() {
    return await db
      .select()
      .from(trips)
      .where(eq(trips.status, "in_progress"))
      .orderBy(desc(trips.updatedAt));
  },
}; 