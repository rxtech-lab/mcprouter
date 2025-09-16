import { test, expect, Page } from "@playwright/test";
import {
  clearDatabase,
  verifyUserEmail,
  createTestKey,
  createTestUser,
  getUserByEmail,
} from "./utils/database";

// Helper function to setup WebAuthn Virtual Authenticator
async function setupWebAuthnVirtualAuthenticator(page: Page) {
  const context = page.context();

  await context.addInitScript(() => {
    if (!window.PublicKeyCredential) {
      (window as any).PublicKeyCredential = class {
        static isUserVerifyingPlatformAuthenticatorAvailable() {
          return Promise.resolve(true);
        }
        static isConditionalMediationAvailable() {
          return Promise.resolve(true);
        }
      };
    }
  });

  const cdpSession = await context.newCDPSession(page);
  await cdpSession.send("WebAuthn.enable");

  const { authenticatorId } = await cdpSession.send(
    "WebAuthn.addVirtualAuthenticator",
    {
      options: {
        protocol: "ctap2",
        transport: "internal",
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
      },
    },
  );

  return { cdpSession, authenticatorId };
}

// Helper function to generate test email
function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(2, 11)}@example.com`;
}

// Helper function for successful sign-in flow
async function signInSuccessfully(page: Page) {
  const testEmail = generateTestEmail();
  // Step 2: Create WebAuthn credential by going through signup flow first
  await page.goto("/auth/signup");
  await page.getByTestId("email-input").fill(testEmail);
  await page.getByTestId("passkey-signup-button").click();
  await page.waitForLoadState("networkidle");
  await verifyUserEmail(testEmail);

  await page.waitForTimeout(1000);
  await page.reload();
  // Should be redirected to dashboard since user is verified
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  // get the user id from the database
  const user = await getUserByEmail(testEmail);
  if (!user) {
    throw new Error("User not found");
  }

  return { testEmail, userId: user.id };
}

test.describe("Dashboard Keys Management", () => {
  let cdpSession: any;
  let authenticatorId: string;

  test.beforeEach(async ({ page }) => {
    // Clear database before each test
    await clearDatabase();

    // Setup WebAuthn Virtual Authenticator
    const webauthn = await setupWebAuthnVirtualAuthenticator(page);
    cdpSession = webauthn.cdpSession;
    authenticatorId = webauthn.authenticatorId;
  });

  test.afterEach(async () => {
    // Clean up the virtual authenticator
    if (cdpSession && authenticatorId) {
      try {
        await cdpSession.send("WebAuthn.removeVirtualAuthenticator", {
          authenticatorId,
        });
        await cdpSession.send("WebAuthn.disable");
      } catch (error) {
        console.warn("Failed to clean up virtual authenticator:", error);
      }
    }
  });

  test("User can navigate to keys page", async ({ page }) => {
    // Sign in successfully
    await signInSuccessfully(page);

    // Navigate to keys page
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
    // Sign in successfully
    await signInSuccessfully(page);

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
    // Sign in successfully
    await signInSuccessfully(page);

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
    // Sign in successfully
    const { userId } = await signInSuccessfully(page);

    // Create test MCP keys for the signed-in user
    await createTestKey(userId, "user", "MCP Key 1");
    await createTestKey(userId, "user", "MCP Key 2");

    // Navigate to keys page
    await page.reload();
    await page.goto("/dashboard/keys");

    // Should see both MCP keys
    await expect(page.getByText("MCP Key 1")).toBeVisible();
    await expect(page.getByText("MCP Key 2")).toBeVisible();
  });

  test("User can view server keys", async ({ page }) => {
    // Sign in successfully
    const { userId } = await signInSuccessfully(page);

    // Create test server keys for the signed-in user
    await createTestKey(userId, "server", "Server Key 1");
    await createTestKey(userId, "server", "Server Key 2");

    await page.reload();
    // Navigate to keys page and switch to server tab
    await page.goto("/dashboard/keys?tab=server");

    // Should see both server keys
    await expect(page.getByText("Server Key 1")).toBeVisible();
    await expect(page.getByText("Server Key 2")).toBeVisible();
  });

  test("User can switch between MCP and server key tabs", async ({ page }) => {
    // Sign in successfully
    const { userId } = await signInSuccessfully(page);

    // Create keys of both types
    await createTestKey(userId, "user", "My MCP Key");
    await createTestKey(userId, "server", "My Server Key");

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
    // Sign in successfully
    const { userId } = await signInSuccessfully(page);

    // Create a test MCP key
    const key = await createTestKey(userId, "user", "Key to Delete");

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
    // Sign in successfully
    const { userId } = await signInSuccessfully(page);

    // Create a test server key
    const key = await createTestKey(userId, "server", "Server Key to Delete");

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
    // Sign in successfully
    const { userId } = await signInSuccessfully(page);

    // Create a test key
    const key = await createTestKey(userId, "user", "Key to Keep");

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
    // Sign in successfully
    await signInSuccessfully(page);

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
    // Create first user and their keys
    const { userId: userId1 } = await signInSuccessfully(page);

    // Create keys for first user
    await createTestKey(userId1, "user", "User 1 MCP Key");
    await createTestKey(userId1, "server", "User 1 Server Key");

    // Create a second user
    const testUser2Email = generateTestEmail();
    const testUser2 = await createTestUser(testUser2Email);
    await createTestKey(testUser2.id, "user", "User 2 MCP Key");
    await createTestKey(testUser2.id, "server", "User 2 Server Key");

    // Navigate to keys page
    await page.goto("/dashboard/keys");

    // First user should only see their own MCP key
    await expect(page.getByText("User 1 MCP Key")).toBeVisible();
    await expect(page.getByText("User 2 MCP Key")).not.toBeVisible();

    // Switch to server tab
    await page.getByTestId("tab-server").click();

    // First user should only see their own server key
    await expect(page.getByText("User 1 Server Key")).toBeVisible();
    await expect(page.getByText("User 2 Server Key")).not.toBeVisible();
  });

  test("Empty state shows create button", async ({ page }) => {
    // Sign in successfully
    await signInSuccessfully(page);

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
    // Sign in successfully
    await signInSuccessfully(page);

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
    // Sign in successfully
    const { userId } = await signInSuccessfully(page);

    // Create keys of both types
    const mcpKey = await createTestKey(userId, "user", "MCP Key Test");
    const serverKey = await createTestKey(userId, "server", "Server Key Test");

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
