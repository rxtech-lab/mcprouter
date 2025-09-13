import { clearDatabase } from "./database";

async function globalTeardown() {
  console.log("[E2E TEARDOWN] Starting global teardown...");

  try {
    // Clean up the test database after all tests are done
    await clearDatabase();
    console.log("[E2E TEARDOWN] Test database cleaned successfully");
  } catch (error) {
    console.error("[E2E TEARDOWN] Failed to clean test database:", error);
    // Don't throw here as we want teardown to complete
  }

  console.log("[E2E TEARDOWN] Global teardown completed");
}

export default globalTeardown;
