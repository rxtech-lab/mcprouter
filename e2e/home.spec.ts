import { test, expect } from "@playwright/test";
import { clearDatabase, createTestMcpServer } from "./utils/database";

test.describe("Home Page", () => {
  test.beforeEach(async () => {
    // Clear database before each test
    await clearDatabase();
  });

  test("displays hero section correctly", async ({ page }) => {
    await page.goto("/");

    // Check hero section content
    await expect(
      page.getByRole("heading", { name: "Discover MCP Servers" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Explore a curated collection of Model Context Protocol servers",
      ),
    ).toBeVisible();
  });

  test("displays category filters", async ({ page }) => {
    await page.goto("/");

    // Check category filter buttons exist
    await expect(page.getByTestId("category-filter-all")).toBeVisible();
    await expect(page.getByTestId("category-filter-crypto")).toBeVisible();
    await expect(page.getByTestId("category-filter-finance")).toBeVisible();
    await expect(page.getByTestId("category-filter-language")).toBeVisible();
    await expect(page.getByTestId("category-filter-networking")).toBeVisible();
    await expect(page.getByTestId("category-filter-security")).toBeVisible();
    await expect(page.getByTestId("category-filter-storage")).toBeVisible();

    // "All Categories" should be selected by default
    await expect(page.getByTestId("category-filter-all")).toHaveClass(
      /bg-primary/,
    );
  });

  test("can filter by category", async ({ page }) => {
    // Create test servers with different categories
    await createTestMcpServer("test-user", {
      name: "Crypto Server",
      category: "crypto",
      isPublic: true,
    });
    await createTestMcpServer("test-user", {
      name: "Finance Server",
      category: "finance",
      isPublic: true,
    });

    await page.waitForTimeout(1000)

    await page.goto("/");

    // Wait for servers to load
    await expect(page.getByTestId("servers-count")).toBeVisible();

    // Click crypto category filter
    await page.getByTestId("category-filter-crypto").click();

    // Check that crypto category is selected
    await expect(page.getByTestId("category-filter-crypto")).toHaveClass(
      /bg-primary/,
    );

    // Should see filtered results (this depends on the filtering implementation)
    await expect(page.getByTestId("servers-count")).toBeVisible();
  });

  test("can reset to all categories", async ({ page }) => {
    await page.goto("/");

    // Click a specific category first
    await page.getByTestId("category-filter-crypto").click();
    await expect(page.getByTestId("category-filter-crypto")).toHaveClass(
      /bg-primary/,
    );

    // Click "All Categories" to reset
    await page.getByTestId("category-filter-all").click();
    await expect(page.getByTestId("category-filter-all")).toHaveClass(
      /bg-primary/,
    );
    await expect(page.getByTestId("category-filter-crypto")).not.toHaveClass(
      /bg-primary/,
    );
  });

  test("displays public servers", async ({ page }) => {
    // Create test public servers
    const server1 = await createTestMcpServer("test-user-1", {
      name: "Public Server 1",
      category: "crypto",
      isPublic: true,
    });
    const server2 = await createTestMcpServer("test-user-2", {
      name: "Public Server 2",
      category: "finance",
      isPublic: true,
    });

    await page.goto("/");

    // Wait for servers to load
    await expect(page.getByTestId("servers-count")).toBeVisible();

    // Check that servers are displayed
    await expect(page.getByText("Public Server 1")).toBeVisible();
    await expect(page.getByText("Public Server 2")).toBeVisible();

    // Check server count
    await expect(page.getByTestId("servers-count")).toContainText(
      "2 servers available",
    );
  });

  test("does not display private servers", async ({ page }) => {
    // Create one public and one private server
    await createTestMcpServer("test-user-1", {
      name: "Public Server",
      category: "crypto",
      isPublic: true,
    });
    await createTestMcpServer("test-user-2", {
      name: "Private Server",
      category: "finance",
      isPublic: false,
    });

    await page.goto("/");

    // Wait for servers to load
    await expect(page.getByTestId("servers-count")).toBeVisible();

    // Should only see the public server
    await expect(page.getByText("Public Server")).toBeVisible();
    await expect(page.getByText("Private Server")).not.toBeVisible();

    // Check server count shows only public server
    await expect(page.getByTestId("servers-count")).toContainText(
      "1 server available",
    );
  });

  test("clicking server card navigates to detail page", async ({ page }) => {
    // Create a test server
    const server = await createTestMcpServer("test-user", {
      name: "Test Server",
      category: "crypto",
      isPublic: true,
    });

    await page.goto("/");

    // Wait for server to load
    await expect(page.getByText("Test Server")).toBeVisible();

    // Click on the server card
    await page.getByTestId("mcp-server-card").first().click();

    // Should navigate to detail page
    await expect(page).toHaveURL(new RegExp(`/servers/${server.id}`));
  });

  test("displays no servers message when no public servers exist", async ({
    page,
  }) => {
    // Don't create any servers
    await page.goto("/");

    // Should show no servers message
    await expect(page.getByTestId("no-servers")).toBeVisible();
    await expect(page.getByText("No servers found")).toBeVisible();
    await expect(
      page.getByText("No MCP servers are available at the moment"),
    ).toBeVisible();
  });

  test("server cards display correct information", async ({ page }) => {
    // Create a test server with various properties
    await createTestMcpServer("test-user", {
      name: "Feature Rich Server",
      category: "crypto",
      isPublic: true,
      locationType: ["remote", "local"],
      authenticationMethods: ["apiKey"],
    });

    await page.goto("/");

    // Wait for server to load
    await expect(page.getByText("Feature Rich Server")).toBeVisible();

    const serverCard = page.getByTestId("mcp-server-card").first();

    // Check server name is displayed
    await expect(serverCard.getByText("Feature Rich Server")).toBeVisible();

    // Check category badge is displayed
    await expect(serverCard.getByText("crypto")).toBeVisible();
  });
});
