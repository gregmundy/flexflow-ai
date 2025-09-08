import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://flexflow_user:flexflow_password@localhost:5432/flexflow_dev',
  },
  verbose: true,
  strict: true,
  // Ignore system schemas and extensions
  tablesFilter: ["!pg_*", "!information_schema*", "!public.pg_*"],
});