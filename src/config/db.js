import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config.js';

let pool;

const connectDB = async () => {
  try {
    // Use DATABASE_URL if available (for production), otherwise use individual vars
    const dbConfig = process.env.DATABASE_URL ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    } : {
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    };

    // Add connection pool settings and force IPv4
    const poolConfig = {
      ...dbConfig,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      family: 4, // Add this line to force IPv4 connections
      options: '-c default_transaction_isolation=read_committed'
    };

    console.log('🔗 Attempting database connection...');
    
    pool = new Pool(poolConfig);

    // Set error handler for the pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client:', err);
    });

    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('✅ Database test successful');
    console.log('⏰ Server time:', result.rows[0].current_time);
    
    client.release();
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('❌ Error code:', error.code);
    
    // Don't crash in production, allow app to start
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️  Running without database. API will return errors for DB operations.');
      return null;
    } else {
      process.exit(1);
    }
  }
};

export { pool };
export default connectDB;
