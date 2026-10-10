import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const { Pool } = pg;

const primaryUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/arrow_puzzle';
const readReplicaUrl = process.env.READ_REPLICA_URL || process.env.DATABASE_URL_REPLICA || primaryUrl;

const isRemoteDb = Boolean(
  primaryUrl && (
    primaryUrl.includes('neon.tech') ||
    primaryUrl.includes('sslmode=require') ||
    process.env.NODE_ENV === 'production'
  )
);

// Primary Pool (Handles Writes: INSERT, UPDATE, DELETE)
export const pool = new Pool({
  connectionString: primaryUrl,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 8000,
  max: 20
});

// Read Replica Pool (Handles Scaled Reads: SELECT)
export const readPool = (readReplicaUrl !== primaryUrl)
  ? new Pool({
      connectionString: readReplicaUrl,
      ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 8000,
      max: 30
    })
  : pool;

let isPgConnected = false;
let isReplicaConnected = false;

export async function checkDatabaseConnection() {
  try {
    const connectPromise = pool.connect();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 6000));
    const client = await Promise.race([connectPromise, timeoutPromise]);
    const res = await client.query('SELECT NOW()');
    client.release();
    isPgConnected = true;
    console.log('✅ Connected to Primary PostgreSQL database at', res.rows[0].now);

    // If separate read replica is configured, check it too
    if (readPool !== pool) {
      try {
        const replicaClient = await readPool.connect();
        await replicaClient.query('SELECT 1');
        replicaClient.release();
        isReplicaConnected = true;
        console.log('✅ Connected to Read Replica PostgreSQL database');
      } catch (repErr) {
        isReplicaConnected = false;
        console.warn('⚠️ Read Replica not reachable (' + repErr.message + '). Routing reads to Primary DB.');
      }
    } else {
      isReplicaConnected = true;
    }

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

export function getIsReplicaConnected() {
  return isReplicaConnected;
}

/**
 * Scaled Read Query - routes to Read Replica pool with automatic fallback to primary
 */
export async function readQuery(text, params) {
  if (isReplicaConnected && readPool !== pool) {
    try {
      return await readPool.query(text, params);
    } catch (err) {
      console.warn('Read replica query failed, falling back to primary:', err.message);
    }
  }
  return pool.query(text, params);
}

/**
 * Write Query - routes directly to Primary database pool
 */
export async function writeQuery(text, params) {
  return pool.query(text, params);
}
