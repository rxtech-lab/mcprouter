import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  users,
  accounts,
  sessions,
  authenticators,
} from "../../src/lib/db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.TEST_DATABASE_URL!);
const db = drizzle(sql);

export async function clearDatabase() {
  try {
    // Clear all tables in the correct order (respecting foreign key constraints)
    // Child tables first, then parent tables
    await db.delete(authenticators);
    await db.delete(accounts);
    await db.delete(sessions);
    await db.delete(users);

    console.log("[TEST DB] Database cleared successfully");
  } catch (error) {
    console.error("[TEST DB] Error clearing database:", error);
    throw error;
  }
}

export async function verifyUserEmail(email: string) {
  try {
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
      throw new Error(`User with email ${email} not found`);
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

export { db as testDb };
