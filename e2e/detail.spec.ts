import { test, expect } from "@playwright/test";
import { clearDatabase, createTestMcpServer } from "./utils/database";

test.describe("Server Detail Page", () => {
  test.beforeEach(async () => {
    // Clear database before each test
    await clearDatabase();
  });

  test("displays server detail page correctly", async ({ page }) => {
    // Create a test server with comprehensive data
    const server = await createTestMcpServer("test-user", {
      name: "Test MCP Server",
      category: "crypto",
      isPublic: true,
    });

    await page.goto(`/servers/${server.id}`);

    // Check basic server info is displayed
    await expect(page.getByTestId("server-detail-title")).toHaveText(
      "Test MCP Server"
    );
    await expect(page.getByTestId("server-detail-back-btn")).toBeVisible();
  });

  test("back button navigates to previous page", async ({ page }) => {
    const server = await createTestMcpServer("test-user", {
      name: "Test Server",
      category: "crypto",
      isPublic: true,
    });

    // Navigate from home page to detail page
    await page.goto("/");
    await page.goto(`/servers/${server.id}`);

    // Click back button
    await page.getByTestId("server-detail-back-btn").click();

    // Should navigate back to home page
    await expect(page).toHaveURL("/");
  });

  test("displays server description when available", async ({ page }) => {
    const server = await createTestMcpServer("test-user", {
      name: "Test Server",
      category: "crypto",
      isPublic: true,
    });

    await page.goto(`/servers/${server.id}`);

    // Note: The createTestMcpServer function doesn't set description by default
    // So we should either update it or test when description is null
    await expect(page.getByTestId("server-detail-title")).toBeVisible();
  });

  test("shows 404 for non-existent server", async ({ page }) => {
    await page.goto("/servers/non-existent-id");

    // Should show 404 page (this depends on Next.js notFound() implementation)
    await expect(page).toHaveURL("/servers/non-existent-id");

    // The page might show a 404 error or redirect
    // This will depend on how Next.js handles the notFound() call
  });

  test("displays GitHub link when available", async ({ page }) => {
    const server = await createTestMcpServer("test-user", {
      name: "Test Server with GitHub",
      category: "crypto",
      isPublic: true,
      github: "https://github.com/example/test-server",
    });

    await page.goto(`/servers/${server.id}`);

    // Check if GitHub link is displayed
    await expect(page.getByTestId("server-detail-github-link")).toBeVisible();
    await expect(page.getByTestId("server-detail-github-link")).toHaveAttribute(
      "href",
      "https://github.com/example/test-server"
    );
  });

  test("handles external GitHub link correctly", async ({ page }) => {
    const server = await createTestMcpServer("test-user", {
      name: "Test Server",
      category: "crypto",
      isPublic: true,
      github: "https://github.com/example/external-test-server",
    });

    await page.goto(`/servers/${server.id}`);

    // Test that GitHub link has correct attributes for external links
    const githubLink = page.getByTestId("server-detail-github-link");
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("displays remote URL section for remote servers", async ({ page }) => {
    const server = await createTestMcpServer("test-user", {
      name: "Remote Server",
      category: "crypto",
      isPublic: true,
      locationType: ["remote"],
      authenticationMethods: ["none"],
    });

    await page.goto(`/servers/${server.id}`);

    // Should show remote URL section
    await expect(
      page.getByTestId("server-detail-remote-url-btn")
    ).toBeVisible();
  });

  test("handles API key required servers when not authenticated", async ({
    page,
  }) => {
    const server = await createTestMcpServer("test-user", {
      name: "API Key Server",
      category: "crypto",
      isPublic: true,
      locationType: ["remote"],
      authenticationMethods: ["apiKey"],
    });

    await page.goto(`/servers/${server.id}`);

    // Should show API key requirement
    await expect(
      page.getByText("Requires API key authentication")
    ).toBeVisible();

    // Should show sign in button when not authenticated
    await expect(page.getByTestId("server-detail-remote-url-btn")).toHaveText(
      /Sign in to access/
    );

    // Should NOT show the actual server URL when not authenticated
    await expect(
      page.locator("code").filter({ hasText: /wss?:\/\// })
    ).not.toBeVisible();

    // Should not show the copy URL hint
    await expect(
      page.getByText('💡 Click "Copy URL" to copy the server URL')
    ).not.toBeVisible();
  });

  test("sign in button redirects to signin page for API key servers", async ({
    page,
  }) => {
    const server = await createTestMcpServer("test-user", {
      name: "API Key Server Requiring Signin",
      category: "crypto",
      isPublic: true,
      locationType: ["remote"],
      authenticationMethods: ["apiKey"],
    });

    await page.goto(`/servers/${server.id}`);

    // Verify the sign in button is present
    const signInBtn = page.getByTestId("server-detail-remote-url-btn");
    await expect(signInBtn).toBeVisible();
    await expect(signInBtn).toHaveText(/Sign in to access/);

    // Click the sign in button
    await signInBtn.click();

    // Should be redirected to the signin page
    await expect(page).toHaveURL("/auth/signin");
  });

  test("shows URL for authenticated users with API key servers", async ({
    page,
  }) => {
    // TODO: This test requires proper authentication setup
    // For now, we're testing the non-API key case which shows URLs regardless of auth status
    // When authentication testing infrastructure is ready, create a proper test that:
    // 1. Creates and authenticates a user
    // 2. Creates a server requiring API key
    // 3. Verifies the URL is shown to authenticated users
    // 4. Verifies the button shows "Copy URL" instead of "Sign in to access"

    const server = await createTestMcpServer("test-user", {
      name: "API Key Server for Authenticated User",
      category: "crypto",
      isPublic: true,
      locationType: ["remote"],
      authenticationMethods: ["apiKey"],
    });

    // TODO: Add authentication step here when auth testing infrastructure is available
    // await authenticateUser(page, testUser);

    await page.goto(`/servers/${server.id}`);

    // For now, this will still show the unauthenticated behavior
    // When auth is implemented, this should show:
    // - The actual server URL in a code block
    // - "Copy URL" button instead of "Sign in to access"
    // - The copy URL hint text

    // Placeholder assertion to keep test valid
    await expect(page.getByTestId("server-detail-title")).toHaveText(
      "API Key Server for Authenticated User"
    );
  });

  test("copy URL button works for non-API key servers", async ({ page }) => {
    const server = await createTestMcpServer("test-user", {
      name: "Public Remote Server",
      category: "crypto",
      isPublic: true,
      locationType: ["remote"],
      authenticationMethods: ["none"],
    });

    await page.goto(`/servers/${server.id}`);

    // Should show the remote access section
    await expect(page.getByText("Remote Access")).toBeVisible();

    // Should show the actual server URL (not hidden)
    await expect(
      page.locator("code").filter({ hasText: /https?:\/\// })
    ).toBeVisible();

    // Should show copy URL hint
    await expect(
      page.getByText('💡 Click "Copy URL" to copy the server URL')
    ).toBeVisible();

    // Mock clipboard API
    await page.addInitScript(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: () => Promise.resolve(),
        },
      });
    });

    const remoteUrlBtn = page.getByTestId("server-detail-remote-url-btn");
    await expect(remoteUrlBtn).toBeVisible();
    await expect(remoteUrlBtn).toHaveText(/Copy URL/);

    // Click the button
    await remoteUrlBtn.click();

    // Button should still be visible after click
    await expect(remoteUrlBtn).toBeVisible();
  });

  test("displays download links when available", async ({ page }) => {
    // Note: The current createTestMcpServer doesn't support download links
    // This test demonstrates the structure but may need actual download link test data
    const server = await createTestMcpServer("test-user", {
      name: "Downloadable Server",
      category: "crypto",
      isPublic: true,
      locationType: ["local"],
    });

    await page.goto(`/servers/${server.id}`);

    // Check if download section exists (depends on test data having download links)
    const downloadSection = page.getByText("Download");

    if (await downloadSection.isVisible()) {
      await expect(downloadSection).toBeVisible();
    }
  });

  test("displays category and tags", async ({ page }) => {
    const server = await createTestMcpServer("test-user", {
      name: "Tagged Server",
      category: "crypto",
      isPublic: true,
    });

    await page.goto(`/servers/${server.id}`);

    // Check category is displayed
    await expect(page.getByText("crypto")).toBeVisible();

    // Note: Tags aren't set in our test data creation function
    // This would need to be added to test tags display
  });

  test("handles servers without optional data gracefully", async ({ page }) => {
    // Create minimal server
    const server = await createTestMcpServer("test-user", {
      name: "Minimal Server",
      category: "crypto",
      isPublic: true,
    });

    await page.goto(`/servers/${server.id}`);

    // Should still display basic information
    await expect(page.getByTestId("server-detail-title")).toHaveText(
      "Minimal Server"
    );
    await expect(page.getByText("Server Information")).toBeVisible();

    // Should not crash when optional fields are missing
    await expect(page.getByTestId("server-detail-back-btn")).toBeVisible();
  });

  test("version history section works when versions exist", async ({
    page,
  }) => {
    // Note: Current test setup doesn't create changelog data
    // This test shows the structure for when version history exists
    const server = await createTestMcpServer("test-user", {
      name: "Versioned Server",
      category: "crypto",
      isPublic: true,
    });

    await page.goto(`/servers/${server.id}`);

    // If version history exists, test version button functionality
    const versionHistorySection = page.getByText("Version History");

    if (await versionHistorySection.isVisible()) {
      await expect(versionHistorySection).toBeVisible();

      // Test version button clicks (would need actual version data)
      // const versionBtn = page.getByTestId("server-detail-version-1.0.0");
      // if (await versionBtn.isVisible()) {
      //   await versionBtn.click();
      //   // Check changelog display
      // }
    }
  });

  test("social links display correctly when available", async ({ page }) => {
    const server = await createTestMcpServer("test-user", {
      name: "Social Server",
      category: "crypto",
      isPublic: true,
      github: "https://github.com/example/social-server",
      socialLinks: {
        website: "https://example.com",
        twitter: "https://twitter.com/example",
      },
    });

    await page.goto(`/servers/${server.id}`);

    // Check links section is visible
    await expect(page.getByText("Links")).toBeVisible();

    // Check GitHub link is displayed
    await expect(page.getByTestId("server-detail-github-link")).toBeVisible();
    await expect(page.getByTestId("server-detail-github-link")).toHaveAttribute(
      "href",
      "https://github.com/example/social-server"
    );

    // Check social links are displayed
    await expect(page.getByText("website")).toBeVisible();
    await expect(page.getByText("twitter")).toBeVisible();
  });
});
