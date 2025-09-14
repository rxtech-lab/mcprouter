import { db } from "../index";
import { keys } from "../schema";
import { eq, and, desc, lt, SQL } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Key type enum matching the database schema
 */
export type KeyType = "user" | "server";

/**
 * Data required to create a new key
 */
export interface CreateKeyData {
  /** The name of the key */
  name: string;
  /** The key value */
  value: string;
  /** The type of key - either 'user' or 'server' */
  type: KeyType;
  /** The ID of the user creating the key */
  createdBy: string;
}

/**
 * Optional data for updating an existing key
 */
export interface UpdateKeyData {
  /** Updated name for the key */
  name?: string;
  /** Updated value for the key */
  value?: string;
  /** Updated type for the key */
  type?: KeyType;
}

/**
 * Options for listing keys with filtering and pagination
 */
export interface ListKeysOptions {
  /** User ID to filter keys by */
  userId: string;
  /** Optional key type filter */
  type?: KeyType;
  /** Cursor for pagination (ISO date string) */
  cursor?: string;
  /** Maximum number of keys to return (default: 20) */
  limit?: number;
}

/**
 * Paginated response for key listings
 */
export interface PaginatedKeys {
  /** Array of keys */
  data: Array<{
    id: string;
    name: string;
    value: string;
    type: KeyType;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  /** Cursor for the next page */
  nextCursor?: string;
  /** Whether there are more keys available */
  hasMore: boolean;
}

/**
 * Creates a new key in the database
 * @param data - The key data to create
 * @returns Promise resolving to the created key
 */
export async function createKey(data: CreateKeyData) {
  const id = nanoid();

  const [newKey] = await db
    .insert(keys)
    .values({
      id,
      name: data.name,
      value: data.value,
      type: data.type,
      createdBy: data.createdBy,
    })
    .returning();

  return newKey;
}

/**
 * Retrieves a key by its ID, ensuring it belongs to the specified user
 * @param id - The key ID to retrieve
 * @param userId - The user ID that owns the key
 * @returns Promise resolving to the key or null if not found
 */
export async function getKeyById(id: string, userId: string) {
  const [key] = await db
    .select()
    .from(keys)
    .where(and(eq(keys.id, id), eq(keys.createdBy, userId)))
    .limit(1);

  return key || null;
}

/**
 * Updates an existing key, ensuring it belongs to the specified user
 * @param id - The key ID to update
 * @param userId - The user ID that owns the key
 * @param data - The updated key data
 * @returns Promise resolving to the updated key or null if not found
 */
export async function updateKey(
  id: string,
  userId: string,
  data: UpdateKeyData,
) {
  const [updatedKey] = await db
    .update(keys)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(keys.id, id), eq(keys.createdBy, userId)))
    .returning();

  return updatedKey || null;
}

/**
 * Deletes a key, ensuring it belongs to the specified user
 * @param id - The key ID to delete
 * @param userId - The user ID that owns the key
 * @returns Promise resolving to the deleted key or null if not found
 */
export async function deleteKey(id: string, userId: string) {
  const [deletedKey] = await db
    .delete(keys)
    .where(and(eq(keys.id, id), eq(keys.createdBy, userId)))
    .returning();

  return deletedKey || null;
}

/**
 * Lists keys with cursor-based pagination and optional filtering
 * @param options - The listing options including user ID, type filter, cursor, and limit
 * @returns Promise resolving to paginated keys response
 */
export async function listKeys(
  options: ListKeysOptions,
): Promise<PaginatedKeys> {
  const { userId, type, cursor, limit = 20 } = options;

  let whereConditions: SQL<unknown> = eq(keys.createdBy, userId);

  if (type) {
    whereConditions = and(whereConditions, eq(keys.type, type))!;
  }

  if (cursor) {
    whereConditions = and(
      whereConditions,
      lt(keys.createdAt, new Date(cursor)),
    )!;
  }

  const results = await db
    .select()
    .from(keys)
    .where(whereConditions)
    .orderBy(desc(keys.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1]?.createdAt.toISOString()
    : undefined;

  return {
    data,
    nextCursor,
    hasMore,
  };
}

/**
 * Lists keys filtered by type for a specific user
 * @param userId - The user ID to filter keys by
 * @param type - The key type to filter by
 * @param cursor - Optional cursor for pagination
 * @param limit - Maximum number of keys to return (default: 20)
 * @returns Promise resolving to paginated keys response
 */
export async function listKeysByType(
  userId: string,
  type: KeyType,
  cursor?: string,
  limit = 20,
): Promise<PaginatedKeys> {
  return listKeys({ userId, type, cursor, limit });
}
