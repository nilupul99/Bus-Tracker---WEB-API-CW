import pkg from 'pg';
const { Pool } = pkg;

let pool;

const connectDB = async () => {
  try {
    // Use the direct connection string with correct password
    const config = {
      host: 'db.rtyqwxpkeuemxbphotwl.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: '5rZD9zKlDCDo5TRj',
      ssl: {
        rejectUnauthorized: false
      },
      // Connection pool settings
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      // Force IPv4 to avoid IPv6 issues
      family: 4
    };

    console.log('🔗 Attempting database connection...');
    console.log('🌐 Host:', config.host);
    console.log('🔌 Port:', config.port);
    
    pool = new Pool(config);

    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to Supabase PostgreSQL');
    
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
