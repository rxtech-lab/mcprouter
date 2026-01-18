import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }
}
