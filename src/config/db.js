import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config.js';

let pool;

const connectDB = async () => {
  try {
    let poolConfig;

    if (process.env.DATABASE_URL) {
      // Parse the DATABASE_URL and reconstruct with individual properties
      // This allows us to set family: 4 properly
      const url = new URL(process.env.DATABASE_URL);
      
      poolConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1), // Remove leading slash
        user: url.username,
        password: url.password,
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false
        } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
        family: 4, // Force IPv4
        options: '-c default_transaction_isolation=read_committed'
      };
    } else {
      // Use individual environment variables
      poolConfig = {
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.user,
        password: config.database.password,
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false
        } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
        family: 4, // Force IPv4
        options: '-c default_transaction_isolation=read_committed'
      };
    }

    
    pool = new Pool(poolConfig);

    // Set error handler for the pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client:', err);
    });

    // Test connection
    const client = await pool.connect();
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version()');
    
    client.release();
    return pool;
  } catch (error) {
    
    // Don't crash in production, allow app to start
    if (process.env.NODE_ENV === 'production') {

      return null;
    } else {
      process.exit(1);
    }
  }
};

export { pool };
export default connectDB;
