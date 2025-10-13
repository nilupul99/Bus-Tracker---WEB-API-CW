import pkg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'ntc_bus_tracking'
});

// Ensure the buses table exists (safety for non-docker runs)
const ensureSchema = async () => {
  const initPath = path.resolve(process.cwd(), 'seeds', 'init.sql');
  if (fs.existsSync(initPath)) {
    const sql = fs.readFileSync(initPath, 'utf8');
    try {
      await pool.query(sql);
      console.log('PostgreSQL schema ensured');
    } catch (err) {
      console.error('Failed to ensure PostgreSQL schema:', err.message);
      throw err;
    }
  } else {
    console.warn('⚠️ init.sql not found; ensure your schema is present');
  }
};

const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL');
    await ensureSchema();
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
    process.exit(1);
  }
};

export { pool };
export default connectDB;
