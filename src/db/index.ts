import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create the PostgreSQL connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/flexflow_dev';
const client = postgres(connectionString, { 
  prepare: false,
  max: 1,
});

// Create Drizzle database instance
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Export schema for use in other files
export * from './schema';

// Helper function to close the database connection
export const closeDb = async () => {
  await client.end();
};

// Database connection test
export const testConnection = async () => {
  try {
    // Simple query to test connection
    await db.select().from(schema.userProfiles).limit(1);
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};