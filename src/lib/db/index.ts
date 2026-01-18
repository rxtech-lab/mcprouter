import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const isTestMode =
  process.env.IS_PLAYWRIGHT_TEST === "true" ||
  process.env.IS_E2E_TEST === "true";

const databaseUrl = isTestMode
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    `${isTestMode ? "TEST_DATABASE_URL" : "DATABASE_URL"} is not set`,
  );
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });

export * from "./schema";
