import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  users,
  accounts,
  sessions,
  authenticators,
  mcpServers,
  keys,
  changelogs,
} from "../../src/lib/db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.TEST_DATABASE_URL!);
const db = drizzle(sql);

export async function clearDatabase() {
  try {
    // Clear all tables in the correct order (respecting foreign key constraints)
    // Child tables first, then parent tables
    // Use try-catch for each table in case some don't exist yet
    const tablesToClear = [
      { name: "changelogs", table: changelogs },
      { name: "mcpServers", table: mcpServers },
      { name: "keys", table: keys },
      { name: "authenticators", table: authenticators },
      { name: "accounts", table: accounts },
      { name: "sessions", table: sessions },
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

export async function verifyUserEmail(email: string) {
  try {
    // Wait for user to be created (WebAuthn signup may take some time)
    let user = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!user && attempts < maxAttempts) {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        user = existingUser;
        break;
      }

      console.log(
        `[TEST DB] Waiting for user ${email} to be created... (attempt ${attempts + 1}/${maxAttempts})`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;
    }

    if (!user) {
      throw new Error(
        `User with email ${email} not found after ${maxAttempts} attempts`,
      );
    }

    const result = await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, email))
      .returning({
        id: users.id,
        email: users.email,
        emailVerified: users.emailVerified,
      });

    if (result.length === 0) {
      throw new Error(`Failed to verify user with email ${email}`);
    }

    console.log(`[TEST DB] User ${email} verified successfully`, result[0]);
    return result[0];
  } catch (error) {
    console.error(`[TEST DB] Error verifying user ${email}:`, error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`[TEST DB] Error getting user ${email}:`, error);
    throw error;
  }
}

export async function isUserEmailVerified(email: string): Promise<boolean> {
  try {
    const user = await getUserByEmail(email);
    return user ? !!user.emailVerified : false;
  } catch (error) {
    console.error(
      `[TEST DB] Error checking verification status for ${email}:`,
      error,
    );
    throw error;
  }
}

export async function createTestUser(email: string, name?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        email,
        name: name || "Test User",
        emailVerified: null,
        role: "user",
      })
      .returning();

    console.log(`[TEST DB] Test user created:`, result[0]);
    return result[0];
  } catch (error) {
    console.error(`[TEST DB] Error creating test user ${email}:`, error);
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
  }>,
) {
  try {
    const defaultData = {
      name: `Test Server ${Date.now()}`,
      url: "https://example.com/mcp",
      category: "crypto" as const,
      isPublic: true,
      locationType: ["remote"],
      authenticationMethods: ["none"],
    };

    const mergedData = { ...defaultData, ...serverData };

    // Create the insert data, omitting fields that might not exist in the test DB
    const insertData = {
      id: `test_server_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: mergedData.name,
      url: mergedData.url,
      category: mergedData.category as any,
      locationType: mergedData.locationType as any,
      authenticationMethods: mergedData.authenticationMethods as any,
      isPublic: mergedData.isPublic,
      createdBy: userId,
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
    const result = await db
      .insert(keys)
      .values({
        id: `test_key_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: name || `Test ${keyType} Key`,
        value: `test_key_value_${Date.now()}`,
        type: keyType,
        createdBy: userId,
      })
      .returning();

    console.log(`[TEST DB] Test ${keyType} key created:`, result[0]);
    return result[0];
  } catch (error) {
    console.error(`[TEST DB] Error creating test ${keyType} key:`, error);
    throw error;
  }
}

export { db as testDb };
