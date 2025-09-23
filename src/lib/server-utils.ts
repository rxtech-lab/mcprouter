import "server-only";

import { generateVerificationToken, generateTokenExpiry } from "./auth-utils";
import { createVerificationToken } from "./redis/verification-queries";
import { getKeyById } from "./db/queries/key_queries";
import type {
  McpAuthenticationMethod,
  McpServerLocationType,
  SocialLinks,
  DownloadLink,
  ImageStructure,
} from "./db/queries/mcp_queries";

export async function getVerificationUrl(email: string) {
  const token = generateVerificationToken();
  const expires = generateTokenExpiry();
  const isPlaywrightTest = process.env.IS_PLAYWRIGHT_TEST === "true";
  if (!isPlaywrightTest) {
    await createVerificationToken(email, token, expires);
  }
  return `${process.env.AUTH_URL}/auth/verify?email=${encodeURIComponent(email)}&token=${token}`;
}

/**
 * MCP Server data structure for URL generation
 */
export interface McpServerData {
  id: string;
  name: string;
  url: string | null;
  version: string | null;
  description: string | null;
  github: string | null;
  socialLinks: SocialLinks | null;
  downloadLinks: DownloadLink[] | null;
  locationType: McpServerLocationType[] | null;
  category: string | null;
  tags: string[] | null;
  image: ImageStructure | null;
  authenticationMethods: McpAuthenticationMethod[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generates a URL with API key authentication
 * @param baseUrl - The base URL template (may contain {{version}} placeholder)
 * @param apiKey - The API key to append
 * @param version - Optional version to substitute in URL template
 * @returns The complete authenticated URL
 */
export function generateUrlWithApiKey(
  baseUrl: string,
  apiKey: string,
  version?: string | null
): string {
  let url = baseUrl;

  // Replace version placeholder if version is provided
  if (version && url.includes("{{version}}")) {
    url = url.replace(/\{\{version\}\}/g, version);
  }

  // Parse URL to handle query parameters properly
  const urlObj = new URL(url);

  // Add API key as query parameter
  urlObj.searchParams.set("api-key", apiKey);

  return urlObj.toString();
}

/**
 * Constructs an MCP server URL with user's API key
 * @param mcpServer - The MCP server data
 * @param userApiKey - The user's API key
 * @returns The complete authenticated URL or null if no URL is available
 */
export function constructMcpServerUrl(
  mcpServer: McpServerData,
  userApiKey: string
): string | null {
  if (!mcpServer.url) {
    return null;
  }

  // Check if the server requires API key authentication
  const requiresApiKey = mcpServer.authenticationMethods.includes("apiKey");

  if (!requiresApiKey) {
    // If no API key required, just return the URL with version substitution
    let url = mcpServer.url;
    if (mcpServer.version && url.includes("{{version}}")) {
      url = url.replace(/\{\{version\}\}/g, mcpServer.version);
    }
    return url;
  }

  // Generate URL with API key
  return generateUrlWithApiKey(mcpServer.url, userApiKey, mcpServer.version);
}

/**
 * Validates that a user has access to an API key for a server
 * @param serverId - The MCP server ID
 * @param userId - The user ID
 * @param keyId - The API key ID to validate
 * @returns Promise resolving to true if valid, false otherwise
 */
export async function validateApiKeyForServer(
  serverId: string,
  userId: string,
  keyId: string
): Promise<boolean> {
  try {
    // Get the key to verify ownership and type
    const key = await getKeyById(keyId, userId);

    if (!key) {
      return false;
    }

    // For now, we just verify the user owns the key
    // In the future, you might want to check if the key is specifically
    // associated with the server or has the right permissions
    return key.type === "user" || key.type === "server";
  } catch (error) {
    console.error("Error validating API key for server:", error);
    return false;
  }
}
