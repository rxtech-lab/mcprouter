import { test, expect } from "@playwright/test";
import {
  clearDatabase,
  createTestMcpServer,
  createTestUser,
  ensureE2ETestUser,
  E2E_TEST_USER,
} from "./utils/database";

test.describe("Dashboard MCP Server Management", () => {
  test.beforeEach(async ({ page }) => {
    // Clear database and ensure the E2E test user exists
    await clearDatabase();
    await ensureE2ETestUser();
  });

  test("User can create MCP server", async ({ page }) => {
    // Navigate to dashboard (auth is bypassed in E2E test mode)
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // Click create server button
    await page.getByTestId("create-server-button").click();

    // Fill in step 1 (Basic Info)
    await page.getByTestId("name-input").fill("Test MCP Server");
    await page.getByTestId("url-input").fill("https://example.com/mcp");
    await page.getByTestId("github-input").fill("https://github.com/test/repo");

    // Go to next step and wait for validation
    await page.getByTestId("next-button").click();
    await expect(page.getByTestId("step-1-content")).toBeVisible();

    // Step 2 (Links & Social) - skip for now
    await page.getByTestId("next-button").click();
    await expect(page.getByTestId("step-2-content")).toBeVisible();

    // Step 3 (Configuration)
    await page.getByTestId("remote-checkbox").check();
    await page.getByTestId("auth-none-checkbox").check();
    await page.getByTestId("public-checkbox").check();

    // Go to next step and wait for validation
    await page.getByTestId("next-button").click();
    await expect(page.getByTestId("step-3-content")).toBeVisible();

    // Step 4 (Media & Images) - fill in required fields to avoid validation errors
    await page.getByTestId("cover-input").fill("https://example.com/cover.jpg");
    await page.getByTestId("logo-input").fill("https://example.com/logo.png");
    // Icon is optional, so we can leave it empty

    // Wait for submit button to be enabled (all steps completed)
    await expect(page.getByTestId("submit-button")).toBeEnabled({
      timeout: 5000,
    });

    // Submit the form
    await page.getByTestId("submit-button").click();

    // Wait for form submission and redirect
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Should see the created server
    await expect(page.getByText("Test MCP Server")).toBeVisible();
  });

  test("User can view MCP servers", async ({ page }) => {
    // Create test MCP servers for the E2E test user
    await createTestMcpServer(E2E_TEST_USER.id, {
      name: "Server 1",
      category: "crypto",
    });
    await createTestMcpServer(E2E_TEST_USER.id, {
      name: "Server 2",
      category: "finance",
    });

    // Navigate to dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // Should see both servers
    await expect(page.getByText("Server 1")).toBeVisible();
    await expect(page.getByText("Server 2")).toBeVisible();

    // Should show correct count
    await expect(page.getByText("2 servers found")).toBeVisible();
  });

  test("User can update MCP server", async ({ page }) => {
    const server = await createTestMcpServer(E2E_TEST_USER.id, {
      name: "Original Server Name",
      category: "crypto",
    });

    // Navigate to dashboard
    await page.goto("/dashboard");

    // Find the server card and click menu
    const serverCard = page.getByTestId(`server-card-${server.id}`);
    await serverCard.getByTestId("server-card-menu").click();

    // Click edit action
    await page.getByTestId("edit-server-action").click();

    // Should see edit dialog
    await expect(page.getByText("Edit MCP Server")).toBeVisible();

    // Update the name
    await page.getByTestId("name-input").clear();
    await page.getByTestId("name-input").fill("Updated Server Name");

    // Navigate to final step and submit
    await page.getByTestId("next-button").click(); // Step 2
    await page.getByTestId("next-button").click(); // Step 3
    await page.getByTestId("next-button").click(); // Step 4
    await page.getByTestId("submit-button").click();

    // Should see updated server name
    await expect(page.getByText("Updated Server Name")).toBeVisible();
    await expect(page.getByText("Original Server Name")).not.toBeVisible();
  });

  test("User can delete MCP server", async ({ page }) => {
    const server = await createTestMcpServer(E2E_TEST_USER.id, {
      name: "Server to Delete",
      category: "crypto",
    });

    // Navigate to dashboard
    await page.goto("/dashboard");

    // Find the server card and click menu
    const serverCard = page.getByTestId(`server-card-${server.id}`);
    await serverCard.getByTestId("server-card-menu").click();

    // Setup dialog handler for confirmation
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain("Are you sure you want to delete");
      dialog.accept();
    });

    // Click delete action
    await page.getByTestId("delete-server-action").click();

    // Server should be removed from the page
    await expect(page.getByText("Server to Delete")).not.toBeVisible();
    await expect(page.getByText("No servers found")).toBeVisible();
  });

  test("User can close create form without saving", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");

    // Click create server button
    await page.getByTestId("create-server-button").click();

    // Fill in some data
    await page.getByTestId("name-input").fill("Temp Server");

    // Click cancel button
    await page.getByTestId("cancel-button").click();
  });

  test("User can only see servers they created", async ({ page }) => {
    // Create servers for E2E test user
    await createTestMcpServer(E2E_TEST_USER.id, {
      name: "User 1 Server A",
      category: "crypto",
    });
    await createTestMcpServer(E2E_TEST_USER.id, {
      name: "User 1 Server B",
      category: "finance",
    });

    // Create a second user and their server
    const testUser2 = await createTestUser("Test User 2");
    await createTestMcpServer(testUser2.id, {
      name: "User 2 Server",
      category: "tools",
    });

    // Navigate to dashboard
    await page.goto("/dashboard");

    // E2E test user should only see their own servers
    await expect(page.getByText("User 1 Server A")).toBeVisible();
    await expect(page.getByText("User 1 Server B")).toBeVisible();
    await expect(page.getByText("User 2 Server")).not.toBeVisible();

    // Should show correct count (only their servers)
    await expect(page.getByText("2 servers found")).toBeVisible();
  });
});
