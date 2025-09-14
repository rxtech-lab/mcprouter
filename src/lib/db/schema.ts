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
  lastVerificationEmailSent: timestamp("lastVerificationEmailSent"),
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
  name: text("name").notNull().default("default"),
});

export const authenticatorsPK = primaryKey({
  columns: [authenticators.userId, authenticators.credentialID],
});

// mcp servers
export const mcpServers = pgTable("McpServer", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  category: text("category", {
    enum: [
      "crypto",
      "finance",
      "language",
      "networking",
      "security",
      "storage",
    ],
  }),
  tags: text("tags").array(),
  image: text("image"),
  authenticationMethods: text("authenticationMethod", {
    enum: ["none", "apiKey", "oauth"],
  })
    .array()
    .notNull()
    .default(["none"]),
  isPublic: boolean("isPublic").notNull().default(true),
  createdBy: text("createdBy")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// keys
export const keys = pgTable("Key", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  type: text("type", {
    enum: ["user", "server"],
  }).notNull(),
  createdBy: text("createdBy")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
