import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const { Pool } = pg;

const isRemoteDb = Boolean(
  process.env.DATABASE_URL && (
    process.env.DATABASE_URL.includes('neon.tech') ||
    process.env.DATABASE_URL.includes('sslmode=require') ||
    process.env.NODE_ENV === 'production'
  )
);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/arrow_puzzle',
  ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 8000,
});

let isPgConnected = false;

export async function checkDatabaseConnection() {
  try {
    const connectPromise = pool.connect();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 6000));
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
