import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Set the maximum number of connections in the pool
  min: 2, // Set the minimum number of connections in the pool
  idleTimeoutMillis: 30000, // Set the idle timeout for connections in milliseconds
  connectionTimeoutMillis: 2000, // Set the connection timeout for acquiring a connection in milliseconds 
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
 
});

export const db = drizzle({ client: pool });