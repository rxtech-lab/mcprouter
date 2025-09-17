import { test, expect, Page } from "@playwright/test";
import {
  clearDatabase,
  verifyUserEmail,
  createTestMcpServer,
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

  await verifyUserEmail(testEmail);

  // Wait for automatic redirect to dashboard after email verification
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  // get the user id from the database
  const user = await getUserByEmail(testEmail);
  if (!user) {
    throw new Error("User not found");
  }

  return { testEmail, userId: user.id };
}

test.describe("Dashboard MCP Server Management", () => {
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

  test("User can create MCP server", async ({ page }) => {
    // Sign in successfully
    const { testEmail, userId } = await signInSuccessfully(page);
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
    // Sign in successfully
    const { testEmail, userId } = await signInSuccessfully(page);

    // Create test MCP servers for the signed-in user
    await createTestMcpServer(userId, {
      name: "Server 1",
      category: "crypto",
    });
    await createTestMcpServer(userId, {
      name: "Server 2",
      category: "finance",
    });

    await page.reload();

    // Should see both servers
    await expect(page.getByText("Server 1")).toBeVisible();
    await expect(page.getByText("Server 2")).toBeVisible();

    // Should show correct count
    await expect(page.getByText("2 servers found")).toBeVisible();
  });

  test("User can update MCP server", async ({ page }) => {
    // Sign in successfully
    const { testEmail, userId } = await signInSuccessfully(page);

    const server = await createTestMcpServer(userId, {
      name: "Original Server Name",
      category: "crypto",
    });

    await page.reload();
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
    // Sign in successfully
    const { testEmail, userId } = await signInSuccessfully(page);

    const server = await createTestMcpServer(userId, {
      name: "Server to Delete",
      category: "crypto",
    });

    // Find the server card and click menu
    await page.reload();
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
    // Sign in successfully
    const { testEmail, userId } = await signInSuccessfully(page);

    // Click create server button
    await page.getByTestId("create-server-button").click();

    // Fill in some data
    await page.getByTestId("name-input").fill("Temp Server");

    // Click cancel button
    await page.getByTestId("cancel-button").click();
  });

  test("User can only see servers they created", async ({ page }) => {
    // Create first user and their servers
    const { userId: userId1 } = await signInSuccessfully(page);

    // Create servers for first user
    await createTestMcpServer(userId1, {
      name: "User 1 Server A",
      category: "crypto",
    });
    await createTestMcpServer(userId1, {
      name: "User 1 Server B",
      category: "finance",
    });

    // Create a second user
    const testUser2Email = generateTestEmail();
    const testUser2 = await createTestUser(testUser2Email);
    await createTestMcpServer(testUser2.id, {
      name: "User 2 Server",
      category: "tools",
    });

    await page.reload();

    // First user should only see their own servers
    await expect(page.getByText("User 1 Server A")).toBeVisible();
    await expect(page.getByText("User 1 Server B")).toBeVisible();
    await expect(page.getByText("User 2 Server")).not.toBeVisible();

    // Should show correct count for first user (only their servers)
    await expect(page.getByText("2 servers found")).toBeVisible();
  });
});
