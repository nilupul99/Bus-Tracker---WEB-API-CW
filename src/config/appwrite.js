import { Client, Databases, ID } from 'node-appwrite';
import { config } from './config.js';

let client;
let databases;

const connectAppwrite = async () => {
  try {
    console.log('🔗 Initializing Appwrite connection...');
    console.log('🌐 Endpoint:', config.appwrite.endpoint);
    console.log('🆔 Project ID:', config.appwrite.projectId);
    
    client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId)
      .setKey(config.appwrite.apiKey);

    databases = new Databases(client);

    // Test connection by listing databases
    await databases.list();
    console.log('✅ Connected to Appwrite successfully');
    
    return { client, databases };
  } catch (error) {
    console.error('❌ Appwrite connection failed:', error.message);
    
    // Don't crash in production, allow app to start
    if (config.nodeEnv === 'production') {
      console.error('⚠️  Running without database. API will return errors for DB operations.');
      return null;
    } else {
      process.exit(1);
    }
  }
};

export { client, databases, ID };
export default connectAppwrite;