"use server";

import {
  listPublicMcpServers,
  searchPublicMcpServers as searchPublicMcpServersQuery,
  getPublicMcpServerDetailWithChangelogs,
  type ListPublicMcpServersOptions,
  type SearchPublicMcpServersOptions,
  type PaginatedMcpServers,
  type McpServerWithChangelogs,
} from "@/lib/db/queries/mcp_queries";
import {
  constructMcpServerUrl,
  validateApiKeyForServer,
} from "@/lib/server-utils";
import { auth } from "@/auth";

/**
 * Server action to get public MCP servers with pagination
 */
export async function getPublicMcpServers(
  options: ListPublicMcpServersOptions = {},
): Promise<PaginatedMcpServers> {
  try {
    return await listPublicMcpServers(options);
  } catch (error) {
    console.error("Error fetching public MCP servers:", error);
    throw new Error("Failed to fetch MCP servers");
  }
}

/**
 * Server action to search public MCP servers
 */
export async function searchPublicMcpServers(
  options: SearchPublicMcpServersOptions,
): Promise<PaginatedMcpServers> {
  try {
    return await searchPublicMcpServersQuery(options);
  } catch (error) {
    console.error("Error searching public MCP servers:", error);
    throw new Error("Failed to search MCP servers");
  }
}

/**
 * Server action to get public MCP server detail with changelogs
 */
export async function getPublicMcpServerDetail(
  serverId: string,
): Promise<McpServerWithChangelogs | null> {
  try {
    return await getPublicMcpServerDetailWithChangelogs(serverId);
  } catch (error) {
    console.error("Error fetching MCP server detail:", error);
    throw new Error("Failed to fetch MCP server details");
  }
}

/**
 * Server action to generate authenticated URL for MCP server
 * Requires user authentication and valid API key
 */
export async function generateServerUrlWithApiKey(
  serverId: string,
  keyId: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    // Get the server details
    const server = await getPublicMcpServerDetailWithChangelogs(serverId);

    if (!server) {
      return { success: false, error: "Server not found" };
    }

    // Check if server requires API key
    if (!server.authenticationMethods.includes("apiKey")) {
      // If no API key required, return the URL directly
      let url = server.url;
      if (server.version && url?.includes("{{version}}")) {
        url = url.replace(/\{\{version\}\}/g, server.version);
      }
      return { success: true, url: url || undefined };
    }

    // Validate the API key belongs to the user
    const isValidKey = await validateApiKeyForServer(
      serverId,
      session.user.id,
      keyId,
    );

    if (!isValidKey) {
      return { success: false, error: "Invalid API key" };
    }

    // For now, we'll use a placeholder API key since we need the actual raw key
    // In a real implementation, you'd need to retrieve the raw key value
    // which should only be shown once during creation
    const placeholderApiKey = "your-api-key-here";

    const authenticatedUrl = constructMcpServerUrl(server, placeholderApiKey);

    if (!authenticatedUrl) {
      return { success: false, error: "Unable to generate URL" };
    }

    return { success: true, url: authenticatedUrl };
  } catch (error) {
    console.error("Error generating server URL with API key:", error);
    return { success: false, error: "Failed to generate authenticated URL" };
  }
}

/**
 * Server action to trigger file download for local MCP servers
 */
export async function downloadMcpServerFile(
  serverId: string,
  platform: string,
): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
  try {
    const server = await getPublicMcpServerDetailWithChangelogs(serverId);

    if (!server) {
      return { success: false, error: "Server not found" };
    }

    if (!server.downloadLinks) {
      return { success: false, error: "No download links available" };
    }

    const downloadLink = server.downloadLinks.find(
      (link) => link.platform === platform,
    );

    if (!downloadLink) {
      return { success: false, error: `No download available for ${platform}` };
    }

    return { success: true, downloadUrl: downloadLink.link };
  } catch (error) {
    console.error("Error getting download link:", error);
    return { success: false, error: "Failed to get download link" };
  }
}
