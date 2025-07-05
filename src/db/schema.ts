import { boolean, decimal, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Example: Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Example: Vessels table (since your app seems to be about ferries)
export const vessels = pgTable("vessels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  vesselId: varchar("vessel_id", { length: 50 }).notNull().unique(),
  inService: boolean("in_service").default(false),
  atDock: boolean("at_dock").default(false),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  heading: decimal("heading", { precision: 5, scale: 1 }),
  speed: decimal("speed", { precision: 5, scale: 1 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Example: Vessel positions history table
export const vesselPositions = pgTable("vessel_positions", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").references(() => vessels.id).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 6 }).notNull(),
  heading: decimal("heading", { precision: 5, scale: 1 }),
  speed: decimal("speed", { precision: 5, scale: 1 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Example: Trips table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").references(() => vessels.id).notNull(),
  departurePort: varchar("departure_port", { length: 100 }),
  arrivalPort: varchar("arrival_port", { length: 100 }),
  departureTime: timestamp("departure_time"),
  arrivalTime: timestamp("arrival_time"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, in_progress, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export types for use in your application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Vessel = typeof vessels.$inferSelect;
export type NewVessel = typeof vessels.$inferInsert;
export type VesselPosition = typeof vesselPositions.$inferSelect;
export type NewVesselPosition = typeof vesselPositions.$inferInsert;
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert; 