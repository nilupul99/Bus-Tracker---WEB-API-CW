import pkg from 'pg';
const { Pool } = pkg;

let pool;

const connectDB = async () => {
  try {
    // Use DATABASE_URL for Supabase connection
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for Supabase
      }
    });

    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to Supabase PostgreSQL');
    client.release();
    
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

export { pool };
export default connectDB;
