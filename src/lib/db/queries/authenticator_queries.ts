import { eq } from "drizzle-orm";
import { db } from "../index";
import { authenticators } from "../schema";

/**
 * Get all authenticators by user id
 */
export async function getAuthenticatorsByUserId(userId: string) {
  try {
    const userAuthenticators = await db
      .select()
      .from(authenticators)
      .where(eq(authenticators.userId, userId));
    return userAuthenticators;
  } catch (error) {
    console.error("Error fetching authenticators by user id:", error);
    return [];
  }
}
