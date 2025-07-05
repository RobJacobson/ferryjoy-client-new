import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// Create the connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create the postgres client
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout of 10 seconds
});

// Create the Drizzle database instance
export const db = drizzle(client, { schema });

// Export the client for manual connection management if needed
export { client };

// Export schema for use in other parts of the application
export * from "./schema"; 