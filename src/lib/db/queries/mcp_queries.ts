import { db } from "../index";
import { mcpServers } from "../schema";
import { eq, and, desc, lt, SQL, ilike, or } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * MCP Server category enum matching the database schema
 */
export type McpServerCategory =
  | "crypto"
  | "finance"
  | "language"
  | "networking"
  | "security"
  | "storage";

/**
 * MCP Server authentication method enum matching the database schema
 */
export type McpAuthenticationMethod = "none" | "apiKey" | "oauth";

/**
 * Data required to create a new MCP server
 */
export interface CreateMcpServerData {
  /** The name of the MCP server */
  name: string;
  /** The URL of the MCP server */
  url: string;
  /** Optional description of the MCP server */
  description?: string;
  /** Optional category of the MCP server */
  category?: McpServerCategory;
  /** Optional array of tags for the MCP server */
  tags?: string[];
  /** Optional image URL for the MCP server */
  image?: string;
  /** Array of supported authentication methods (default: ["none"]) */
  authenticationMethods?: McpAuthenticationMethod[];
  /** The ID of the user creating the MCP server */
  createdBy: string;
  /** Whether the MCP server is public */
  isPublic: boolean;
}

/**
 * Optional data for updating an existing MCP server
 */
export interface UpdateMcpServerData {
  /** Updated name for the MCP server */
  name?: string;
  /** Updated URL for the MCP server */
  url?: string;
  /** Updated description for the MCP server */
  description?: string;
  /** Updated category for the MCP server */
  category?: McpServerCategory;
  /** Updated tags array for the MCP server */
  tags?: string[];
  /** Updated image URL for the MCP server */
  image?: string;
  /** Updated authentication methods for the MCP server */
  authenticationMethods?: McpAuthenticationMethod[];
  /** Updated whether the MCP server is public */
  isPublic?: boolean;
}

/**
 * Options for listing MCP servers with filtering and pagination
 */
export interface ListMcpServersOptions {
  /** User ID to filter MCP servers by */
  userId: string;
  /** Optional category filter */
  category?: McpServerCategory;
  /** Cursor for pagination (ISO date string) */
  cursor?: string;
  /** Maximum number of MCP servers to return (default: 20) */
  limit?: number;
}

/**
 * Options for searching MCP servers
 */
export interface SearchMcpServersOptions {
  /** User ID to filter MCP servers by */
  userId: string;
  /** Search query to match against name, description, and tags */
  query: string;
  /** Optional category filter */
  category?: McpServerCategory;
  /** Cursor for pagination (ISO date string) */
  cursor?: string;
  /** Maximum number of MCP servers to return (default: 20) */
  limit?: number;
}

/**
 * Paginated response for MCP server listings
 */
export interface PaginatedMcpServers {
  /** Array of MCP servers */
  data: Array<{
    id: string;
    name: string;
    url: string;
    description: string | null;
    category: McpServerCategory | null;
    tags: string[] | null;
    image: string | null;
    authenticationMethods: McpAuthenticationMethod[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  /** Cursor for the next page */
  nextCursor?: string;
  /** Whether there are more MCP servers available */
  hasMore: boolean;
}

/**
 * Creates a new MCP server in the database
 * @param data - The MCP server data to create
 * @returns Promise resolving to the created MCP server
 */
export async function createMcpServer(data: CreateMcpServerData) {
  const id = nanoid();

  const [newMcpServer] = await db
    .insert(mcpServers)
    .values({
      id,
      name: data.name,
      url: data.url,
      description: data.description || null,
      category: data.category || null,
      tags: data.tags || null,
      image: data.image || null,
      authenticationMethods: data.authenticationMethods || ["none"],
      createdBy: data.createdBy,
      isPublic: data.isPublic || true,
    })
    .returning();

  return newMcpServer;
}

/**
 * Retrieves an MCP server by its ID, ensuring it belongs to the specified user
 * @param id - The MCP server ID to retrieve
 * @param userId - The user ID that owns the MCP server
 * @returns Promise resolving to the MCP server or null if not found
 */
export async function getMcpServerById(id: string, userId: string) {
  const [mcpServer] = await db
    .select()
    .from(mcpServers)
    .where(and(eq(mcpServers.id, id), eq(mcpServers.createdBy, userId)))
    .limit(1);

  return mcpServer || null;
}

/**
 * Updates an existing MCP server, ensuring it belongs to the specified user
 * @param id - The MCP server ID to update
 * @param userId - The user ID that owns the MCP server
 * @param data - The updated MCP server data
 * @returns Promise resolving to the updated MCP server or null if not found
 */
export async function updateMcpServer(
  id: string,
  userId: string,
  data: UpdateMcpServerData,
) {
  const [updatedMcpServer] = await db
    .update(mcpServers)
    .set({
      ...data,
      updatedAt: new Date(),
      isPublic: data.isPublic || true,
    })
    .where(and(eq(mcpServers.id, id), eq(mcpServers.createdBy, userId)))
    .returning();

  return updatedMcpServer || null;
}

/**
 * Deletes an MCP server, ensuring it belongs to the specified user
 * @param id - The MCP server ID to delete
 * @param userId - The user ID that owns the MCP server
 * @returns Promise resolving to the deleted MCP server or null if not found
 */
export async function deleteMcpServer(id: string, userId: string) {
  const [deletedMcpServer] = await db
    .delete(mcpServers)
    .where(and(eq(mcpServers.id, id), eq(mcpServers.createdBy, userId)))
    .returning();

  return deletedMcpServer || null;
}

/**
 * Lists MCP servers with cursor-based pagination and optional filtering
 * @param options - The listing options including user ID, category filter, cursor, and limit
 * @returns Promise resolving to paginated MCP servers response
 */
export async function listMcpServers(
  options: ListMcpServersOptions,
): Promise<PaginatedMcpServers> {
  const { userId, category, cursor, limit = 20 } = options;

  let whereConditions: SQL<unknown> = eq(mcpServers.createdBy, userId);

  if (category) {
    whereConditions = and(whereConditions, eq(mcpServers.category, category))!;
  }

  if (cursor) {
    whereConditions = and(
      whereConditions,
      lt(mcpServers.createdAt, new Date(cursor)),
    )!;
  }

  const results = await db
    .select()
    .from(mcpServers)
    .where(whereConditions)
    .orderBy(desc(mcpServers.createdAt))
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
 * Lists MCP servers filtered by category for a specific user
 * @param userId - The user ID to filter MCP servers by
 * @param category - The category to filter by
 * @param cursor - Optional cursor for pagination
 * @param limit - Maximum number of MCP servers to return (default: 20)
 * @returns Promise resolving to paginated MCP servers response
 */
export async function listMcpServersByCategory(
  userId: string,
  category: McpServerCategory,
  cursor?: string,
  limit = 20,
): Promise<PaginatedMcpServers> {
  return listMcpServers({ userId, category, cursor, limit });
}

/**
 * Searches MCP servers by name, description, and tags with cursor-based pagination
 * @param options - The search options including user ID, query, category filter, cursor, and limit
 * @returns Promise resolving to paginated MCP servers response
 */
export async function searchMcpServers(
  options: SearchMcpServersOptions,
): Promise<PaginatedMcpServers> {
  const { userId, query, category, cursor, limit = 20 } = options;

  const searchPattern = `%${query}%`;

  let whereConditions: SQL<unknown> = and(
    eq(mcpServers.createdBy, userId),
    or(
      ilike(mcpServers.name, searchPattern),
      ilike(mcpServers.description, searchPattern),
    ),
  )!;

  if (category) {
    whereConditions = and(whereConditions, eq(mcpServers.category, category))!;
  }

  if (cursor) {
    whereConditions = and(
      whereConditions,
      lt(mcpServers.createdAt, new Date(cursor)),
    )!;
  }

  const results = await db
    .select()
    .from(mcpServers)
    .where(whereConditions)
    .orderBy(desc(mcpServers.createdAt))
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
