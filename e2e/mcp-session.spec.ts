import { test, expect } from "@playwright/test";
import { clearDatabase, createTestUser, createTestKey } from "./utils/database";

test.describe("MCP Session Authentication API", () => {
  let testUser: any;
  let serverKey: any;
  let userKey: any;

  test.beforeEach(async () => {
    // Clear database before each test
    await clearDatabase();

    // Create test user
    testUser = await createTestUser("test@example.com", "Test User");

    // Create server key for authentication
    serverKey = await createTestKey(testUser.id, "server", "Test Server Key");

    // Create user key for authentication
    userKey = await createTestKey(testUser.id, "user", "Test User Key");
  });

  test("should return 401 when x-api-key header is missing", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/mcp/session", {
      data: {
        userKey: userKey.value,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      error: "Server key is required in x-api-key header",
    });
  });

  test("should return 401 when x-api-key header is invalid", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/mcp/session", {
      headers: {
        "x-api-key": "invalid-server-key",
      },
      data: {
        userKey: userKey.value,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      error: "Invalid server key",
    });
  });

  test("should return 401 when x-api-key is user key instead of server key", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/mcp/session", {
      headers: {
        "x-api-key": userKey.value, // Using user key instead of server key
      },
      data: {
        userKey: userKey.value,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      error: "Invalid server key",
    });
  });

  test("should return 400 when request body is invalid", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/mcp/session", {
      headers: {
        "x-api-key": serverKey.value,
      },
      data: {
        // Missing userKey field
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid request body");
    expect(body.details).toBeDefined();
  });

  test("should return 400 when userKey is empty", async ({ request }) => {
    const response = await request.post("/api/auth/mcp/session", {
      headers: {
        "x-api-key": serverKey.value,
      },
      data: {
        userKey: "",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid request body");
    expect(body.details).toBeDefined();
  });

  test("should return 401 when userKey is invalid", async ({ request }) => {
    const response = await request.post("/api/auth/mcp/session", {
      headers: {
        "x-api-key": serverKey.rawKey,
      },
      data: {
        userKey: "invalid-user-key",
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      error: "Invalid user key",
    });
  });

  test("should return 401 when userKey is server key instead of user key", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/mcp/session", {
      headers: {
        "x-api-key": serverKey.rawKey,
      },
      data: {
        userKey: serverKey.value, // Using server key instead of user key
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      error: "Invalid user key",
    });
  });

  test("should return user data when both keys are valid", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/mcp/session", {
      headers: {
        "x-api-key": serverKey.rawKey,
      },
      data: {
        userKey: userKey.rawKey,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      user: {
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
        emailVerified: testUser.emailVerified,
      },
    });
  });

  test("should return user data with null emailVerified when user is not verified", async ({
    request,
  }) => {
    // Create a new user that's not verified
    const unverifiedUser = await createTestUser(
      "unverified@example.com",
      "Unverified User",
    );
    const unverifiedUserKey = await createTestKey(
      unverifiedUser.id,
      "user",
      "Unverified User Key",
    );

    const response = await request.post("/api/auth/mcp/session", {
      headers: {
        "x-api-key": serverKey.rawKey,
      },
      data: {
        userKey: unverifiedUserKey.rawKey,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.user.emailVerified).toBeNull();
    expect(body.user.email).toBe("unverified@example.com");
  });

  test("should work with keys from different users", async ({ request }) => {
    // Create another user with their own keys
    const otherUser = await createTestUser("other@example.com", "Other User");
    const otherServerKey = await createTestKey(
      otherUser.id,
      "server",
      "Other Server Key",
    );
    const otherUserKey = await createTestKey(
      otherUser.id,
      "user",
      "Other User Key",
    );

    const response = await request.post("/api/auth/mcp/session", {
      headers: {
        "x-api-key": otherServerKey.rawKey,
      },
      data: {
        userKey: otherUserKey.rawKey,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.user.id).toBe(otherUser.id);
    expect(body.user.email).toBe("other@example.com");
  });

  test("should work with cross-user authentication (server key from one user, user key from another)", async ({
    request,
  }) => {
    // Create another user
    const otherUser = await createTestUser("other@example.com", "Other User");
    const otherUserKey = await createTestKey(
      otherUser.id,
      "user",
      "Other User Key",
    );

    // Use server key from first user and user key from second user
    const response = await request.post("/api/auth/mcp/session", {
      headers: {
        "x-api-key": serverKey.rawKey, // From first user
      },
      data: {
        userKey: otherUserKey.rawKey, // From second user
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.user.id).toBe(otherUser.id);
    expect(body.user.email).toBe("other@example.com");
  });

  test("should handle malformed JSON in request body", async ({ request }) => {
    const response = await request.post("/api/auth/mcp/session", {
      headers: {
        "x-api-key": serverKey.rawKey,
        "content-type": "application/json",
      },
      data: "invalid json {",
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid request body");
    expect(body.details).toBeDefined();
  });
});
