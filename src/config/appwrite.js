import { Client, Databases, ID, Query } from 'node-appwrite';
import { config } from './config.js';

let client;
let databases;

const connectAppwrite = async () => {
  try {
    
    client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId)
      .setKey(config.appwrite.apiKey);

    databases = new Databases(client);

    // Test connection by listing databases
    await databases.list();
        
    return { client, databases };
  } catch (error) {
        
    // Don't crash in production, allow app to start
    if (config.nodeEnv === 'production') {
      return null;
    } else {
      process.exit(1);
    }
  }
};

export { client, databases, ID, Query };
export default connectAppwrite;