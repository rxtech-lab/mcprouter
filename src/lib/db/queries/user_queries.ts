import { eq } from "drizzle-orm";
import { db } from "../index";
import { users } from "../schema";

export async function getUserById(id: string) {
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user[0] || null;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user[0] || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function createUser(data: {
  id?: string;
  name?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  role?: "admin" | "user";
}) {
  try {
    const newUser = await db
      .insert(users)
      .values({
        id: data.id || crypto.randomUUID(),
        name: data.name,
        email: data.email,
        emailVerified: data.emailVerified,
        image: data.image,
        role: data.role || "user",
      })
      .returning();

    return newUser[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(
  id: string,
  data: {
    name?: string | null;
    email?: string;
    emailVerified?: Date | null;
    image?: string | null;
    role?: "admin" | "user";
  },
) {
  try {
    const updatedUser = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    return updatedUser[0] || null;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function verifyUserEmail(email: string) {
  try {
    const updatedUser = await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, email))
      .returning();

    return updatedUser[0] || null;
  } catch (error) {
    console.error("Error verifying user email:", error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    await db.delete(users).where(eq(users.id, id));
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}
