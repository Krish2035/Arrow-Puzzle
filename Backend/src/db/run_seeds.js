import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from Backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL environment variable is not defined in .env');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes('neon.tech') || dbUrl.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
});

async function run() {
  try {
    console.log('Connecting to database using credentials from .env...');
    const client = await pool.connect();
    console.log('Connected! Executing schema.sql & seeds.sql...');
    
    // Ensure schema exists first
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      console.log('✅ Schema executed successfully!');
    }

    const seeds = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf8');
    await client.query(seeds);
    console.log('✅ Seeds executed successfully on PostgreSQL!');
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error running seeds:', err.message);
    process.exit(1);
  }
}

run();
