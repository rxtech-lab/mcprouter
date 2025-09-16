import { eq, and } from "drizzle-orm";
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

/**
 * Delete an authenticator by credential ID and user ID
 */
export async function deleteAuthenticatorByCredentialId(
  credentialId: string,
  userId: string,
) {
  try {
    const result = await db
      .delete(authenticators)
      .where(
        and(
          eq(authenticators.credentialID, credentialId),
          eq(authenticators.userId, userId),
        ),
      );
    return result;
  } catch (error) {
    console.error("Error deleting authenticator:", error);
    throw new Error("Failed to delete authenticator");
  }
}
