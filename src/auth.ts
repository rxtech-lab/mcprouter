import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  db,
  users,
  accounts,
  sessions,
  verificationTokens,
  authenticators,
} from "./lib/db";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  session: { strategy: "database" },
  experimental: { enableWebAuthn: true },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.emailVerified = user.emailVerified;
        session.user.role = user.role || "user";
      }
      return session;
    },
  },
});
