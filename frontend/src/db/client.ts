/**
 * Database client configuration.
 * Creates a Drizzle ORM client connected to PostgreSQL via postgres-js.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Creates and returns a Drizzle database client.
 * Uses DATABASE_URL environment variable for connection string.
 */
function createDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // Return a mock client if no DB connection (for build-time)
    return drizzle((undefined as unknown as ReturnType<typeof postgres>), { schema });
  }

  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

export const db = createDb();
export type Database = typeof db;
