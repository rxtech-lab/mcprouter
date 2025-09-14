import { db } from "../index";
import { mcpServers, changelogs } from "../schema";
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
 * MCP Server location type enum matching the database schema
 */
export type McpServerLocationType = "remote" | "local";

/**
 * Social links structure matching the database schema
 */
export interface SocialLinks {
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
}

/**
 * Download link structure for local MCP servers
 */
export interface DownloadLink {
  platform: string;
  link: string;
}

/**
 * Image structure matching the database schema
 */
export interface ImageStructure {
  cover: string;
  logo: string;
  icon?: string;
}

/**
 * Changelog data structure
 */
export interface ChangelogData {
  id: string;
  version: string;
  changelog: string;
  mcpServerId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data required to create a new MCP server
 */
export interface CreateMcpServerData {
  /** The name of the MCP server */
  name: string;
  /** Remote url for the MCP server */
  url?: string;
  /** Version for the MCP server */
  version: string;
  /** Optional description of the MCP server */
  description?: string;
  /** Github repository for the MCP server */
  github?: string;
  /** Social links for the MCP server */
  socialLinks?: SocialLinks;
  /** Download links for local MCP servers */
  downloadLinks?: DownloadLink[];
  /** Location type for the MCP server */
  locationType?: McpServerLocationType[];
  /** Optional category of the MCP server */
  category?: McpServerCategory;
  /** Optional array of tags for the MCP server */
  tags?: string[];
  /** Image structure for the MCP server */
  image?: ImageStructure;
  /** Array of supported authentication methods (default: ["none"]) */
  authenticationMethods?: McpAuthenticationMethod[];
  /** The ID of the user creating the MCP server */
  createdBy: string;
  /** Whether the MCP server is public */
  isPublic?: boolean;
}

/**
 * Optional data for updating an existing MCP server
 */
export interface UpdateMcpServerData {
  /** Updated name for the MCP server */
  name?: string;
  /** Updated URL for the MCP server */
  url?: string;
  /** Updated version for the MCP server */
  version?: string;
  /** Updated description for the MCP server */
  description?: string;
  /** Updated Github repository for the MCP server */
  github?: string;
  /** Updated social links for the MCP server */
  socialLinks?: SocialLinks;
  /** Updated download links for local MCP servers */
  downloadLinks?: DownloadLink[];
  /** Updated location type for the MCP server */
  locationType?: McpServerLocationType[];
  /** Updated category for the MCP server */
  category?: McpServerCategory;
  /** Updated tags array for the MCP server */
  tags?: string[];
  /** Updated image structure for the MCP server */
  image?: ImageStructure;
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
    url: string | null;
    version: string;
    description: string | null;
    github: string | null;
    socialLinks: SocialLinks | null;
    downloadLinks: DownloadLink[] | null;
    locationType: McpServerLocationType[] | null;
    category: McpServerCategory | null;
    tags: string[] | null;
    image: ImageStructure | null;
    authenticationMethods: McpAuthenticationMethod[];
    isPublic: boolean;
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
      url: data.url || null,
      version: data.version,
      description: data.description || null,
      github: data.github || null,
      socialLinks: data.socialLinks || null,
      downloadLinks: data.downloadLinks || null,
      locationType: data.locationType || null,
      category: data.category || null,
      tags: data.tags || null,
      image: data.image || null,
      authenticationMethods: data.authenticationMethods || ["none"],
      isPublic: data.isPublic || true,
      createdBy: data.createdBy,
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

/**
 * Changelog query interfaces and functions
 */

/**
 * Data required to create a new changelog entry
 */
export interface CreateChangelogData {
  /** Version for the changelog */
  version: string;
  /** Changelog content */
  changelog: string;
  /** MCP server ID this changelog belongs to */
  mcpServerId: string;
}

/**
 * Optional data for updating an existing changelog entry
 */
export interface UpdateChangelogData {
  /** Updated version for the changelog */
  version?: string;
  /** Updated changelog content */
  changelog?: string;
}

/**
 * Creates a new changelog entry in the database
 * @param data - The changelog data to create
 * @returns Promise resolving to the created changelog
 */
export async function createChangelog(data: CreateChangelogData) {
  const id = nanoid();

  const [newChangelog] = await db
    .insert(changelogs)
    .values({
      id,
      version: data.version,
      changelog: data.changelog,
      mcpServerId: data.mcpServerId,
    })
    .returning();

  return newChangelog;
}

/**
 * Retrieves all changelogs for a specific MCP server
 * @param mcpServerId - The MCP server ID to get changelogs for
 * @returns Promise resolving to an array of changelogs
 */
export async function getChangelogsByServerId(mcpServerId: string) {
  const results = await db
    .select()
    .from(changelogs)
    .where(eq(changelogs.mcpServerId, mcpServerId))
    .orderBy(desc(changelogs.createdAt));

  return results;
}

/**
 * Retrieves a specific changelog by ID
 * @param id - The changelog ID to retrieve
 * @param mcpServerId - The MCP server ID (for verification)
 * @returns Promise resolving to the changelog or null if not found
 */
export async function getChangelogById(id: string, mcpServerId: string) {
  const [changelog] = await db
    .select()
    .from(changelogs)
    .where(and(eq(changelogs.id, id), eq(changelogs.mcpServerId, mcpServerId)))
    .limit(1);

  return changelog || null;
}

/**
 * Updates an existing changelog entry
 * @param id - The changelog ID to update
 * @param mcpServerId - The MCP server ID (for verification)
 * @param data - The updated changelog data
 * @returns Promise resolving to the updated changelog or null if not found
 */
export async function updateChangelog(
  id: string,
  mcpServerId: string,
  data: UpdateChangelogData,
) {
  const [updatedChangelog] = await db
    .update(changelogs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(changelogs.id, id), eq(changelogs.mcpServerId, mcpServerId)))
    .returning();

  return updatedChangelog || null;
}

/**
 * Deletes a changelog entry
 * @param id - The changelog ID to delete
 * @param mcpServerId - The MCP server ID (for verification)
 * @returns Promise resolving to the deleted changelog or null if not found
 */
export async function deleteChangelog(id: string, mcpServerId: string) {
  const [deletedChangelog] = await db
    .delete(changelogs)
    .where(and(eq(changelogs.id, id), eq(changelogs.mcpServerId, mcpServerId)))
    .returning();

  return deletedChangelog || null;
}

/**
 * Combined query for MCP server with changelogs
 */

/**
 * MCP server with associated changelogs
 */
export interface McpServerWithChangelogs {
  id: string;
  name: string;
  url: string | null;
  version: string;
  description: string | null;
  github: string | null;
  socialLinks: SocialLinks | null;
  downloadLinks: DownloadLink[] | null;
  locationType: McpServerLocationType[] | null;
  category: McpServerCategory | null;
  tags: string[] | null;
  image: ImageStructure | null;
  authenticationMethods: McpAuthenticationMethod[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  changelogs: ChangelogData[];
}

/**
 * Retrieves MCP server details with all its changelogs by server ID
 * @param id - The MCP server ID to retrieve
 * @param userId - The user ID that owns the MCP server
 * @returns Promise resolving to the MCP server with changelogs or null if not found
 */
export async function getMcpServerDetailWithChangelogs(
  id: string,
  userId: string,
): Promise<McpServerWithChangelogs | null> {
  // Get the MCP server
  const mcpServer = await getMcpServerById(id, userId);

  if (!mcpServer) {
    return null;
  }

  // Get all changelogs for this server
  const serverChangelogs = await getChangelogsByServerId(id);

  return {
    ...mcpServer,
    changelogs: serverChangelogs,
  };
}

/**
 * Retrieves MCP server details with all its changelogs by server ID (public version - no user verification)
 * @param id - The MCP server ID to retrieve
 * @returns Promise resolving to the MCP server with changelogs or null if not found
 */
export async function getPublicMcpServerDetailWithChangelogs(
  id: string,
): Promise<McpServerWithChangelogs | null> {
  // Get the MCP server (public version - no user check)
  const [mcpServer] = await db
    .select()
    .from(mcpServers)
    .where(and(eq(mcpServers.id, id), eq(mcpServers.isPublic, true)))
    .limit(1);

  if (!mcpServer) {
    return null;
  }

  // Get all changelogs for this server
  const serverChangelogs = await getChangelogsByServerId(id);

  return {
    ...mcpServer,
    changelogs: serverChangelogs,
  };
}
