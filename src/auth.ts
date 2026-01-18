import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import { db, users } from "./lib/db";

// E2E test user configuration
const E2E_TEST_USER = {
  id: "e2e-test-user-id",
  name: "E2E Test User",
  role: "user" as const,
};

export const { handlers, signIn, auth, signOut } = NextAuth({
  pages: {
    error: "/auth/error",
  },
  session: { strategy: "jwt" },
  providers: [
    {
      id: "oidc",
      name: "OAuth Server",
      type: "oidc",
      issuer: process.env.OAUTH_SERVER_URL,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      authorization: {
        params: {
          scope: "openid read:profile",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          userId: profile.sub,
          name: profile.name || profile.preferred_username || "User",
          role: "user",
        };
      },
    },
  ],
  callbacks: {
    async signIn({ user }) {
      // E2E test bypass - always allow
      if (process.env.IS_E2E_TEST === "true") {
        return true;
      }
      // Upsert user in database
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, (user as any).userId!))
        .limit(1);

      if (!existingUser.length) {
        await db.insert(users).values({
          id: (user as any).userId!,
          name: user.name,
          role: "user",
        });
      } else {
        // Update name if changed
        await db
          .update(users)
          .set({ name: user.name, updatedAt: new Date() })
          .where(eq(users.id, user.id!));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      // E2E test mode - return mock session
      if (process.env.IS_E2E_TEST === "true") {
        return {
          ...session,
          user: {
            id: E2E_TEST_USER.id,
            name: E2E_TEST_USER.name,
            role: E2E_TEST_USER.role,
          },
        };
      }

      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.role = (token.role as string) || "user";
      return session;
    },
  },
});
