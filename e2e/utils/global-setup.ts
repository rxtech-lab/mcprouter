import { clearDatabase } from "./database";

async function globalSetup() {
  console.log("[E2E SETUP] Starting global setup...");

  // Ensure we have required environment variables
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error(
      "TEST_DATABASE_URL environment variable is required for testing",
    );
  }

  try {
    // Clear the test database before running tests
    await clearDatabase();
    console.log("[E2E SETUP] Test database cleared successfully");
  } catch (error) {
    console.error("[E2E SETUP] Failed to clear test database:", error);
    throw error;
  }

  console.log("[E2E SETUP] Global setup completed");
}

export default globalSetup;
