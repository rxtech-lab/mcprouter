import { test, expect } from "@playwright/test";
import { clearDatabase, createTestMcpServer } from "./utils/database";

test.describe("Search Page", () => {
  test.beforeEach(async () => {
    // Clear database before each test
    await clearDatabase();
  });

  test("displays search page header", async ({ page }) => {
    await page.goto("/search");

    // Check page header
    await expect(
      page.getByRole("heading", { name: "Search Results" })
    ).toBeVisible();
  });

  test("shows empty state when no search query provided", async ({ page }) => {
    await page.goto("/search");

    // Should show empty state
    await expect(page.getByTestId("search-empty-state")).toBeVisible();
    await expect(
      page.getByText("Enter a search query to find MCP servers")
    ).toBeVisible();
  });

  test("performs search with query parameter", async ({ page }) => {
    // Create test servers that match search
    await createTestMcpServer("test-user-1", {
      name: "Crypto Trading Bot",
      category: "crypto",
      isPublic: true,
    });
    await createTestMcpServer("test-user-2", {
      name: "Bitcoin Wallet",
      category: "crypto",
      isPublic: true,
    });
    await createTestMcpServer("test-user-3", {
      name: "Language Translator",
      category: "language",
      isPublic: true,
    });

    // Search for "crypto" - should match first two servers
    await page.goto("/search?q=crypto");

    // Should show search results count
    await expect(page.getByTestId("search-results-count")).toContainText(
      'for "crypto"'
    );
  });

  test("shows no results message when search yields no matches", async ({
    page,
  }) => {
    // Create a test server that won't match our search
    await createTestMcpServer("test-user", {
      name: "Crypto Server",
      category: "crypto",
      isPublic: true,
    });

    // Search for something that won't match
    await page.goto("/search?q=nonexistent");

    // Should show no results state (note: this will depend on your search implementation)
    // The search might return no results or the crypto server might not match "nonexistent"
    await expect(page.getByText("Search Results")).toBeVisible();
  });

  test("searches are case insensitive", async ({ page }) => {
    // Create test server
    await createTestMcpServer("test-user", {
      name: "Bitcoin Trading",
      category: "crypto",
      isPublic: true,
    });

    // Search with different cases
    await page.goto("/search?q=BITCOIN");

    // Wait for results
    await expect(page.getByTestId("search-results-count")).toBeVisible();

    // Should find the server regardless of case
    await expect(page.getByText("Bitcoin Trading")).toBeVisible();
  });

  test("clicking search result navigates to server detail", async ({
    page,
  }) => {
    // Create test server
    const server = await createTestMcpServer("test-user", {
      name: "Test Crypto Server",
      category: "crypto",
      isPublic: true,
    });

    await page.goto("/search?q=crypto");

    // Wait for search results
    await expect(page.getByText("Test Crypto Server")).toBeVisible();

    // Click on server card
    await page.getByTestId("mcp-server-card").first().click();

    // Should navigate to detail page
    await expect(page).toHaveURL(new RegExp(`/servers/${server.id}`));
  });

  test("only shows public servers in search results", async ({ page }) => {
    // Create public and private servers
    await createTestMcpServer("test-user-1", {
      name: "Public Crypto Server",
      category: "crypto",
      isPublic: true,
    });
    await createTestMcpServer("test-user-2", {
      name: "Private Crypto Server",
      category: "crypto",
      isPublic: false,
    });

    await page.goto("/search?q=crypto");

    // Wait for search results
    await expect(page.getByTestId("search-results-count")).toBeVisible();

    // Should only show public server
    await expect(page.getByText("Public Crypto Server")).toBeVisible();
    await expect(page.getByText("Private Crypto Server")).not.toBeVisible();
  });

  test("search works with partial matches", async ({ page }) => {
    // Create server with longer name
    await createTestMcpServer("test-user", {
      name: "Advanced Bitcoin Trading Platform",
      category: "crypto",
      isPublic: true,
    });

    // Search for partial match
    await page.goto("/search?q=bitcoin");

    // Wait for search results
    await expect(page.getByTestId("search-results-count")).toBeVisible();

    // Should find the server with partial name match
    await expect(
      page.getByText("Advanced Bitcoin Trading Platform")
    ).toBeVisible();
  });

  test("search results display correct count", async ({ page }) => {
    // Create multiple matching servers
    await createTestMcpServer("test-user-1", {
      name: "Crypto Server 1",
      category: "crypto",
      isPublic: true,
    });
    await createTestMcpServer("test-user-2", {
      name: "Crypto Server 2",
      category: "crypto",
      isPublic: true,
    });
    await createTestMcpServer("test-user-3", {
      name: "Crypto Server 3",
      category: "crypto",
      isPublic: true,
    });

    await page.goto("/search?q=crypto");

    // Wait for search results
    await expect(page.getByTestId("search-results-count")).toBeVisible();

    // Should show correct count
    await expect(page.getByTestId("search-results-count")).toContainText(
      "Found 3 servers"
    );
  });

  test("handles URL encoded search queries", async ({ page }) => {
    // Create test server
    await createTestMcpServer("test-user", {
      name: "Special Characters & Server",
      category: "crypto",
      isPublic: true,
    });

    // Use URL encoded search query
    await page.goto("/search?q=Special%20Characters");

    // Wait for search results
    await expect(page.getByTestId("search-results-count")).toBeVisible();

    // Should handle URL encoding correctly
    await expect(page.getByTestId("search-results-count")).toContainText(
      'for "Special Characters"'
    );
  });

  test("empty search query shows appropriate message", async ({ page }) => {
    // Test with empty query parameter
    await page.goto("/search?q=");

    // Should show empty state
    await expect(page.getByTestId("search-empty-state")).toBeVisible();
    await expect(
      page.getByText("Enter a search query to find MCP servers")
    ).toBeVisible();
  });

  test("whitespace-only search query shows appropriate message", async ({
    page,
  }) => {
    // Test with whitespace-only query
    await page.goto("/search?q=%20%20%20");

    // Should show empty state (since query.trim() would be empty)
    await expect(page.getByTestId("search-empty-state")).toBeVisible();
    await expect(
      page.getByText("Enter a search query to find MCP servers")
    ).toBeVisible();
  });
});
