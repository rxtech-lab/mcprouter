import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/**
 * User table - core user information
 */
export const users = pgTable("User", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  emailVerified: timestamp("emailVerified"),
  image: text("image"),
  role: text("role", {
    enum: ["admin", "user"],
  }).default("user"),
});

/**
 * Account table - OAuth provider accounts and other account types
 * Renamed from oauth for Auth.js v5 compatibility
 */
export const accounts = pgTable("Account", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const accountsPK = primaryKey({
  columns: [accounts.provider, accounts.providerAccountId],
});

/**
 * Session table - user sessions
 */
export const sessions = pgTable("Session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/**
 * Authenticator table - passkey/WebAuthn credentials
 */
export const authenticators = pgTable("Authenticator", {
  credentialID: text("credentialID").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  providerAccountId: text("providerAccountId").notNull(),
  credentialPublicKey: text("credentialPublicKey").notNull(),
  counter: integer("counter").notNull(),
  credentialDeviceType: text("credentialDeviceType").notNull(),
  credentialBackedUp: boolean("credentialBackedUp").notNull(),
  transports: text("transports"),
});

export const authenticatorsPK = primaryKey({
  columns: [authenticators.userId, authenticators.credentialID],
});

export const authenticatorsCredentialIdIdx = uniqueIndex(
  "Authenticator_credentialID_key"
).on(authenticators.credentialID);

/**
 * Verification token table - email verification and password reset tokens
 */
export const verificationTokens = pgTable("VerificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokensPK = primaryKey({
  columns: [verificationTokens.identifier, verificationTokens.token],
});
