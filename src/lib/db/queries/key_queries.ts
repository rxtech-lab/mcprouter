import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, lt, type SQL } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../index";
import { keys } from "../schema";

/**
 * Key type enum matching the database schema
 */
export type KeyType = "user" | "server";

/**
 * Data required to create a new key
 */
export interface CreateKeyData {
  /** The name/description of the key */
  name: string;
  /** The type of key (user/server) */
  type: KeyType;
  /** The ID of the user creating the key */
  createdBy: string;
}

/**
 * Options for listing keys with filtering and pagination
 */
export interface ListKeysOptions {
  /** User ID to filter keys by */
  userId: string;
  /** Key type to filter by */
  type: KeyType;
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
 * Response for key creation including the raw key
 */
export interface CreateKeyResponse {
  /** The created key record */
  key: {
    id: string;
    name: string;
    type: KeyType;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
  /** The raw key value (only shown once) */
  rawKey: string;
}

/**
 * Generates a cryptographically secure random key
 * @returns A 32-byte hex string
 */
function generateRandomKey(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hashes a key value using SHA-256
 * @param key - The raw key to hash
 * @returns The hashed key as a hex string
 */
function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Creates a new key in the database
 * @param data - The key data to create
 * @returns Promise resolving to the created key with raw key value
 */
export async function createKey(
  data: CreateKeyData,
): Promise<CreateKeyResponse> {
  const id = nanoid();
  const rawKey = generateRandomKey();
  const hashedKey = hashKey(rawKey);

  const [newKey] = await db
    .insert(keys)
    .values({
      id,
      name: data.name,
      value: hashedKey,
      type: data.type,
      createdBy: data.createdBy,
    })
    .returning();

  return {
    key: newKey,
    rawKey,
  };
}

/**
 * Retrieves a key by its ID, ensuring it belongs to the specified user
 * @param id - The key ID to retrieve
 * @param userId - The user ID that owns the key
 * @returns Promise resolving to the key or null if not found
 */
export async function getKeyById(id: string, userId: string) {
  const [key] = await db
    .select({
      id: keys.id,
      name: keys.name,
      type: keys.type,
      createdBy: keys.createdBy,
      createdAt: keys.createdAt,
      updatedAt: keys.updatedAt,
    })
    .from(keys)
    .where(and(eq(keys.id, id), eq(keys.createdBy, userId)))
    .limit(1);

  return key || null;
}

/**
 * Lists keys with cursor-based pagination and filtering by type
 * @param options - The listing options including user ID, type filter, cursor, and limit
 * @returns Promise resolving to paginated keys response
 */
export async function listKeys(
  options: ListKeysOptions,
): Promise<PaginatedKeys> {
  const { userId, type, cursor, limit = 20 } = options;

  let whereConditions: SQL<unknown> = and(
    eq(keys.createdBy, userId),
    eq(keys.type, type),
  )!;

  if (cursor) {
    whereConditions = and(
      whereConditions,
      lt(keys.createdAt, new Date(cursor)),
    )!;
  }

  const results = await db
    .select({
      id: keys.id,
      name: keys.name,
      type: keys.type,
      createdBy: keys.createdBy,
      createdAt: keys.createdAt,
      updatedAt: keys.updatedAt,
    })
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
 * Deletes a key, ensuring it belongs to the specified user
 * @param id - The key ID to delete
 * @param userId - The user ID that owns the key
 * @returns Promise resolving to the deleted key or null if not found
 */
export async function deleteKey(id: string, userId: string) {
  const [deletedKey] = await db
    .delete(keys)
    .where(and(eq(keys.id, id), eq(keys.createdBy, userId)))
    .returning({
      id: keys.id,
      name: keys.name,
      type: keys.type,
      createdBy: keys.createdBy,
      createdAt: keys.createdAt,
      updatedAt: keys.updatedAt,
    });

  return deletedKey || null;
}

/**
 * Verifies a raw key against a stored hashed key
 * @param rawKey - The raw key to verify
 * @param hashedKey - The stored hashed key
 * @returns Whether the key is valid
 */
export function verifyKey(rawKey: string, hashedKey: string): boolean {
  return hashKey(rawKey) === hashedKey;
}
