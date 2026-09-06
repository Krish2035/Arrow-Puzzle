import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/arrow_puzzle',
  connectionTimeoutMillis: 2000,
});

let isPgConnected = false;

export async function checkDatabaseConnection() {
  try {
    const connectPromise = pool.connect();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 800));
    const client = await Promise.race([connectPromise, timeoutPromise]);
    const res = await client.query('SELECT NOW()');
    client.release();
    isPgConnected = true;
    console.log('✅ Connected to PostgreSQL database at', res.rows[0].now);
    return true;
  } catch (err) {
    isPgConnected = false;
    console.warn('⚠️ PostgreSQL not reachable (' + err.message + '). Operating with active in-memory/resilient store.');
    return false;
  }
}

export function getIsPgConnected() {
  return isPgConnected;
}
