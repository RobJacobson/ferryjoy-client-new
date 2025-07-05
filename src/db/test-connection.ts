import { db } from './index';

/**
 * Test function to verify database connection
 * Run this with: bun run tsx src/db/test-connection.ts
 */
export const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Simple query to test connection
    const result = await db.execute('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('Current database time:', result[0]?.current_time);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  testConnection()
    .then((success) => {
      if (success) {
        console.log('Database setup is working correctly!');
        process.exit(0);
      } else {
        console.log('Database setup failed. Check your DATABASE_URL and connection.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
} 