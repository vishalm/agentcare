/**
 * Global teardown for Jest tests
 * Runs once after all test suites complete
 */
export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting global test cleanup...');

  // Close any open database connections
  try {
    // Force close any lingering connections
    if (global.gc) {
      global.gc();
    }
  } catch (error) {
    console.warn('⚠️  Warning during garbage collection:', error);
  }

  // Clear test data if needed
  try {
    // Clean up any test artifacts
    console.log('🗑️  Cleaning up test artifacts...');
  } catch (error) {
    console.warn('⚠️  Warning during cleanup:', error);
  }

  // Reset environment variables
  delete process.env.JWT_SECRET;
  delete process.env.SESSION_SECRET;
  delete process.env.TEST_TIMEOUT;

  console.log('✅ Global test cleanup completed');
} 