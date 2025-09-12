import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
    emailVerified?: Date | null;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string;
      emailVerified?: Date | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends DefaultUser {
    role?: string;
    emailVerified?: Date | null;
  }
}
