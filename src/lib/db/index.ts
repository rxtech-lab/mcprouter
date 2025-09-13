import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const databaseUrl =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    `${process.env.NODE_ENV === "test" ? "TEST_DATABASE_URL" : "DATABASE_URL"} is not set`,
  );
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });

export * from "./schema";
