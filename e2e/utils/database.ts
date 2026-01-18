import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users, mcpServers, keys, changelogs } from "../../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashKey, generateRandomKey } from "@/lib/db/queries/key_queries";

const sql = neon(process.env.TEST_DATABASE_URL!);
const db = drizzle(sql);

// E2E test user that will be used when IS_E2E_TEST is enabled
export const E2E_TEST_USER = {
  id: "e2e-test-user-id",
  name: "E2E Test User",
  role: "user" as const,
};

export async function clearDatabase() {
  try {
    // Clear all tables in the correct order (respecting foreign key constraints)
    // Child tables first, then parent tables
    const tablesToClear = [
      { name: "changelogs", table: changelogs },
      { name: "mcpServers", table: mcpServers },
      { name: "keys", table: keys },
      { name: "users", table: users },
    ];

    for (const { name, table } of tablesToClear) {
      try {
        await db.delete(table);
        console.log(`[TEST DB] Cleared ${name} table`);
      } catch (error: any) {
        // Ignore "relation does not exist" errors
        if (error?.cause?.code === "42P01") {
          console.log(`[TEST DB] Table ${name} does not exist, skipping`);
        } else {
          console.error(`[TEST DB] Error clearing ${name} table:`, error);
          throw error;
        }
      }
    }

    console.log("[TEST DB] Database cleared successfully");
  } catch (error) {
    console.error("[TEST DB] Error clearing database:", error);
    throw error;
  }
}

export async function createTestUser(name?: string) {
  try {
    const userId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const result = await db
      .insert(users)
      .values({
        id: userId,
        name: name || "Test User",
        role: "user",
      })
      .returning();

    console.log(`[TEST DB] Test user created:`, result[0]);
    return result[0];
  } catch (error) {
    console.error(`[TEST DB] Error creating test user:`, error);
    throw error;
  }
}

/**
 * Ensures the E2E test user exists in the database.
 * This should be called before tests that need the mock session user.
 */
export async function ensureE2ETestUser() {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, E2E_TEST_USER.id))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`[TEST DB] E2E test user already exists`);
      return existingUser[0];
    }

    const result = await db
      .insert(users)
      .values({
        id: E2E_TEST_USER.id,
        name: E2E_TEST_USER.name,
        role: E2E_TEST_USER.role,
      })
      .returning();

    console.log(`[TEST DB] E2E test user created:`, result[0]);
    return result[0];
  } catch (error) {
    console.error(`[TEST DB] Error ensuring E2E test user:`, error);
    throw error;
  }
}

export async function clearMcpServers() {
  try {
    // Clear changelog table first (if exists)
    try {
      await db.delete(changelogs);
    } catch (error: any) {
      if (error?.cause?.code !== "42P01") {
        throw error;
      }
    }

    // Clear MCP servers table (if exists)
    try {
      await db.delete(mcpServers);
    } catch (error: any) {
      if (error?.cause?.code !== "42P01") {
        throw error;
      }
    }

    console.log("[TEST DB] MCP servers cleared successfully");
  } catch (error) {
    console.error("[TEST DB] Error clearing MCP servers:", error);
    throw error;
  }
}

export async function clearKeys() {
  try {
    try {
      await db.delete(keys);
    } catch (error: any) {
      if (error?.cause?.code !== "42P01") {
        throw error;
      }
    }
    console.log("[TEST DB] Keys cleared successfully");
  } catch (error) {
    console.error("[TEST DB] Error clearing keys:", error);
    throw error;
  }
}

export async function createTestMcpServer(
  userId: string,
  serverData?: Partial<{
    name: string;
    url: string;
    category: string;
    isPublic: boolean;
    locationType: string[];
    authenticationMethods: string[];
    github?: string;
    socialLinks?: {
      website?: string;
      twitter?: string;
      discord?: string;
      telegram?: string;
      instagram?: string;
      youtube?: string;
      linkedin?: string;
      facebook?: string;
      pinterest?: string;
      reddit?: string;
      tiktok?: string;
      twitch?: string;
      vimeo?: string;
    };
  }>,
) {
  try {
    // Ensure the user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (user.length === 0) {
      // Create test user if it doesn't exist
      await db.insert(users).values({
        id: userId,
        name: "Test User",
        role: "user",
      });
      console.log(`[TEST DB] Created test user: ${userId}`);
    }

    const defaultData = {
      name: `Test Server ${Date.now()}`,
      url: "https://example.com/mcp",
      category: "crypto" as const,
      isPublic: true,
      locationType: ["remote"],
      authenticationMethods: ["none"],
    };

    const mergedData = { ...defaultData, ...serverData };

    // Create the insert data
    const insertData = {
      id: `test_server_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: mergedData.name,
      url: mergedData.url,
      category: mergedData.category as any,
      locationType: mergedData.locationType as any,
      authenticationMethods: mergedData.authenticationMethods as any,
      isPublic: mergedData.isPublic,
      createdBy: userId,
      ...(mergedData.github && { github: mergedData.github }),
      ...(mergedData.socialLinks && { socialLinks: mergedData.socialLinks }),
    };

    const result = await db.insert(mcpServers).values(insertData).returning();

    console.log(`[TEST DB] Test MCP server created:`, result[0]);
    return result[0];
  } catch (error) {
    console.error(`[TEST DB] Error creating test MCP server:`, error);
    throw error;
  }
}

export async function createTestKey(
  userId: string,
  keyType: "user" | "server",
  name?: string,
) {
  try {
    // Ensure the user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (user.length === 0) {
      // Create test user if it doesn't exist
      await db.insert(users).values({
        id: userId,
        name: "Test User",
        role: "user",
      });
      console.log(`[TEST DB] Created test user: ${userId}`);
    }

    const rawKey = generateRandomKey();
    const hashedKey = hashKey(rawKey);
    const result = await db
      .insert(keys)
      .values({
        id: `test_key_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: name || `Test ${keyType} Key`,
        value: keyType === "server" ? hashedKey : rawKey,
        type: keyType,
        createdBy: userId,
      })
      .returning();

    console.log(`[TEST DB] Test ${keyType} key created:`, result[0]);
    return {
      ...result[0],
      rawKey,
    };
  } catch (error) {
    console.error(`[TEST DB] Error creating test ${keyType} key:`, error);
    throw error;
  }
}

export { db as testDb };
