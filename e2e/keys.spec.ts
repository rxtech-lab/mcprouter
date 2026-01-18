import { test, expect } from "@playwright/test";
import {
  clearDatabase,
  createTestKey,
  createTestUser,
  ensureE2ETestUser,
  E2E_TEST_USER,
} from "./utils/database";

test.describe("Dashboard Keys Management", () => {
  test.beforeEach(async ({ page }) => {
    // Clear database and ensure the E2E test user exists
    await clearDatabase();
    await ensureE2ETestUser();
  });

  test("User can navigate to keys page", async ({ page }) => {
    // Navigate to keys page (auth is bypassed in E2E test mode)
    await page.goto("/dashboard/keys");

    // Should see keys page content
    await expect(page.getByRole("heading", { name: "API Keys" })).toBeVisible();
    await expect(
      page.getByText("Manage your MCP and server authentication keys"),
    ).toBeVisible();
    await expect(page.getByTestId("tab-mcp")).toBeVisible();
    await expect(page.getByTestId("tab-server")).toBeVisible();
  });

  test("User can create MCP key", async ({ page }) => {
    // Navigate to keys page
    await page.goto("/dashboard/keys");

    // Click create key button
    await page.getByTestId("create-key-button").click();

    // Fill in key name
    await page.getByTestId("key-name-input").fill("Test MCP Key");

    // Submit the form
    await page.getByTestId("create-key-submit").click();

    // Should see success message with the created key
    await expect(page.getByTestId("key-created-success-message")).toBeVisible();

    // Should show the key value
    const keyValue = page.locator("code");
    await expect(keyValue).toBeVisible();

    // Copy button should be visible
    await expect(page.getByTestId("copy-key-button")).toBeVisible();

    // Close the dialog
    await page.getByTestId("close-key-dialog-button").click();

    // Should see the created key in the list
    await expect(page.getByText("Test MCP Key")).toBeVisible();
  });

  test("User can create server key", async ({ page }) => {
    // Navigate to keys page and switch to server tab
    await page.goto("/dashboard/keys?tab=server");

    // Click create key button
    await page.getByTestId("create-key-button").click();

    // Fill in key name
    await page.getByTestId("key-name-input").fill("Test Server Key");

    // Submit the form
    await page.getByTestId("create-key-submit").click();

    // Should see success message
    await expect(page.getByTestId("key-created-success-message")).toBeVisible();

    // Close the dialog
    await page.getByTestId("close-key-dialog-button").click();

    // Should see the created key in the server tab
    await expect(page.getByText("Test Server Key")).toBeVisible();
  });

  test("User can view MCP keys", async ({ page }) => {
    // Create test MCP keys for the E2E test user
    await createTestKey(E2E_TEST_USER.id, "user", "MCP Key 1");
    await createTestKey(E2E_TEST_USER.id, "user", "MCP Key 2");

    // Navigate to keys page
    await page.goto("/dashboard/keys");

    // Should see both MCP keys
    await expect(page.getByText("MCP Key 1")).toBeVisible();
    await expect(page.getByText("MCP Key 2")).toBeVisible();
  });

  test("User can view server keys", async ({ page }) => {
    // Create test server keys for the E2E test user
    await createTestKey(E2E_TEST_USER.id, "server", "Server Key 1");
    await createTestKey(E2E_TEST_USER.id, "server", "Server Key 2");

    // Navigate to keys page and switch to server tab
    await page.goto("/dashboard/keys?tab=server");

    // Should see both server keys
    await expect(page.getByText("Server Key 1")).toBeVisible();
    await expect(page.getByText("Server Key 2")).toBeVisible();
  });

  test("User can switch between MCP and server key tabs", async ({ page }) => {
    // Create keys of both types
    await createTestKey(E2E_TEST_USER.id, "user", "My MCP Key");
    await createTestKey(E2E_TEST_USER.id, "server", "My Server Key");

    // Navigate to keys page
    await page.goto("/dashboard/keys");

    // Should see MCP key by default
    await expect(page.getByText("My MCP Key")).toBeVisible();
    await expect(page.getByText("My Server Key")).not.toBeVisible();

    // Switch to server tab
    await page.getByTestId("tab-server").click();

    // Should see server key
    await expect(page.getByText("My Server Key")).toBeVisible();
    await expect(page.getByText("My MCP Key")).not.toBeVisible();

    // Switch back to MCP tab
    await page.getByTestId("tab-mcp").click();

    // Should see MCP key again
    await expect(page.getByText("My MCP Key")).toBeVisible();
    await expect(page.getByText("My Server Key")).not.toBeVisible();
  });

  test("User can delete MCP key", async ({ page }) => {
    // Create a test MCP key
    const key = await createTestKey(E2E_TEST_USER.id, "user", "Key to Delete");

    // Navigate to keys page
    await page.goto("/dashboard/keys");

    // Setup dialog handler for confirmation
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain(
        "Are you sure you want to delete this key?",
      );
      dialog.accept();
    });

    // Click delete button for the key
    await page.getByTestId(`delete-key-${key.id}`).click();

    // Key should be removed from the page
    await expect(page.getByText("Key to Delete")).not.toBeVisible();
    await expect(page.getByTestId("no-mcp-keys-message")).toBeVisible();
  });

  test("User can delete server key", async ({ page }) => {
    // Create a test server key
    const key = await createTestKey(
      E2E_TEST_USER.id,
      "server",
      "Server Key to Delete",
    );

    // Navigate to server keys tab
    await page.goto("/dashboard/keys?tab=server");

    // Setup dialog handler for confirmation
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain(
        "Are you sure you want to delete this key?",
      );
      dialog.accept();
    });

    // Click delete button for the key
    await page.getByTestId(`delete-key-${key.id}`).click();

    // Key should be removed from the page
    await expect(page.getByText("Server Key to Delete")).not.toBeVisible();
    await expect(page.getByTestId("no-server-keys-message")).toBeVisible();
  });

  test("User can cancel key deletion", async ({ page }) => {
    // Create a test key
    const key = await createTestKey(E2E_TEST_USER.id, "user", "Key to Keep");

    // Navigate to keys page
    await page.goto("/dashboard/keys");

    // Setup dialog handler to cancel
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain(
        "Are you sure you want to delete this key?",
      );
      dialog.dismiss();
    });

    // Click delete button for the key
    await page.getByTestId(`delete-key-${key.id}`).click();

    // Key should still be visible
    await expect(page.getByText("Key to Keep")).toBeVisible();
  });

  test("User can cancel key creation", async ({ page }) => {
    // Navigate to keys page
    await page.goto("/dashboard/keys");

    // Click create key button
    await page.getByTestId("create-key-button").click();

    // Fill in some data
    await page.getByTestId("key-name-input").fill("Cancelled Key");

    // Click cancel button
    await page.getByTestId("cancel-key-button").click();

    // Should not see the key in the list
    await expect(page.getByText("Cancelled Key")).not.toBeVisible();

    // Should see empty state or other keys
    await expect(page.getByTestId("no-mcp-keys-message")).toBeVisible();
  });

  test("User can only see keys they created", async ({ page }) => {
    // Create keys for E2E test user
    await createTestKey(E2E_TEST_USER.id, "user", "User 1 MCP Key");
    await createTestKey(E2E_TEST_USER.id, "server", "User 1 Server Key");

    // Create a second user and their keys
    const testUser2 = await createTestUser("Test User 2");
    await createTestKey(testUser2.id, "user", "User 2 MCP Key");
    await createTestKey(testUser2.id, "server", "User 2 Server Key");

    // Navigate to keys page
    await page.goto("/dashboard/keys");

    // E2E test user should only see their own MCP key
    await expect(page.getByText("User 1 MCP Key")).toBeVisible();
    await expect(page.getByText("User 2 MCP Key")).not.toBeVisible();

    // Switch to server tab
    await page.getByTestId("tab-server").click();

    // E2E test user should only see their own server key
    await expect(page.getByText("User 1 Server Key")).toBeVisible();
    await expect(page.getByText("User 2 Server Key")).not.toBeVisible();
  });

  test("Empty state shows create button", async ({ page }) => {
    // Navigate to keys page
    await page.goto("/dashboard/keys");

    // Should see empty state with create button
    await expect(page.getByTestId("no-mcp-keys-message")).toBeVisible();
    await expect(page.getByTestId("create-first-key-button")).toBeVisible();

    // Click the empty state create button
    await page.getByTestId("create-first-key-button").click();

    // Should open create dialog
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("Key creation form validation works", async ({ page }) => {
    // Navigate to keys page
    await page.goto("/dashboard/keys");

    // Click create key button
    await page.getByTestId("create-key-button").click();

    // Try to submit without filling name
    await page.getByTestId("create-key-submit").click();

    // Should show validation error
    await expect(page.getByText("Name is required")).toBeVisible();

    // Fill with very long name
    const longName = "a".repeat(101);
    await page.getByTestId("key-name-input").fill(longName);
    await page.getByTestId("create-key-submit").click();

    // Should show validation error for long name
    await expect(page.getByText("Name too long")).toBeVisible();
  });

  test("URL tab parameter works correctly", async ({ page }) => {
    // Create keys of both types
    const mcpKey = await createTestKey(
      E2E_TEST_USER.id,
      "user",
      "MCP Key Test",
    );
    const serverKey = await createTestKey(
      E2E_TEST_USER.id,
      "server",
      "Server Key Test",
    );

    // Navigate directly to server tab via URL
    await page.goto("/dashboard/keys?tab=server");

    // Should be on server tab
    await expect(page.getByTestId("tab-server")).toHaveAttribute(
      "data-state",
      "active",
    );
    await expect(page.getByTestId(`key-name-${serverKey.id}`)).toBeVisible();
    await expect(page.getByTestId(`key-name-${mcpKey.id}`)).not.toBeVisible();

    // Navigate to MCP tab via URL
    await page.goto("/dashboard/keys?tab=mcp");

    // Should be on MCP tab
    await expect(page.getByTestId("tab-mcp")).toHaveAttribute(
      "data-state",
      "active",
    );
    await expect(page.getByTestId(`key-name-${mcpKey.id}`)).toBeVisible();
    await expect(
      page.getByTestId(`key-name-${serverKey.id}`),
    ).not.toBeVisible();
  });
});
