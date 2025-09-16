import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { categories } from "@/config/categories";

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

export const changelogs = pgTable("Changelog", {
  id: text("id").primaryKey(),
  /**
   * Version for the changelog
   */
  version: text("version").notNull(),
  /**
   * Changelog for the MCP server
   */
  changelog: text("changelog").notNull(),
  mcpServerId: text("mcpServerId")
    .notNull()
    .references(() => mcpServers.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const changelogsPK = primaryKey({
  columns: [changelogs.mcpServerId, changelogs.version],
});

// mcp servers
export const mcpServers = pgTable("McpServer", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  /**
   * Remote url for the MCP server. Can use https://somedomain.com/mcp/{{version}}/server-name to construct the url.
   * version will be automatically replaced with the version of the MCP server.
   */
  url: text("url"),
  /**
   * Version for the MCP server
   */
  version: text("version"),
  description: text("description"),
  /**
   * Github repository for the MCP server.
   * This will be used to get the latest version of the MCP server as well as the description of the MCP server.
   * Will first use release from github to get the latest version and changelog.
   *
   * However, if not available, will use git tags to get the latest version.
   */
  github: text("github"),
  /**
   * Social links for the MCP server
   */
  socialLinks: jsonb("socialLinks").$type<{
    website?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    facebook?: string;
    pinterest?: string;
    reddit?: string;
    tiktok?: string;
    twitch?: string;
    vimeo?: string;
  }>(),
  /**
   * Download links for the MCP server if it is a local MCP server
   */
  downloadLinks:
    jsonb("downloadLinks").$type<Array<{ platform: string; link: string }>>(),
  /**
   * Location type for the MCP server
   */
  locationType: text("locationType", {
    enum: ["remote", "local"],
  }).array(),
  /**
   * Category for the MCP server
   */
  category: text("category", {
    enum: [...categories] as [string, ...string[]],
  }),
  /**
   * Tags for the MCP server
   */
  tags: text("tags").array(),
  image: jsonb("image").$type<{
    cover?: string;
    logo?: string;
    icon?: string;
  }>(),
  /**
   * Authentication methods for the MCP server
   */
  authenticationMethods: text("authenticationMethods", {
    enum: ["none", "apiKey", "oauth"],
  })
    .array()
    .notNull()
    .default(["none"]),
  isPublic: boolean("isPublic").notNull().default(true),
  /**
   * The user who created the MCP server
   */
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
