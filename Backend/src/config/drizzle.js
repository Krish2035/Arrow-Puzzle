import { drizzle } from 'drizzle-orm/node-postgres';
import { pool, readPool } from './db.js';
import * as schema from '../db/schema.drizzle.js';

// Drizzle ORM instance connected to Primary (Write) pool
export const db = drizzle(pool, { schema });

// Drizzle ORM instance connected to Read Replica pool
export const readDb = drizzle(readPool, { schema });

export { schema };
