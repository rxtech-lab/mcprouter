import { type NextAuthConfig } from "next-auth";

export default {
  providers: [],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {},
} satisfies NextAuthConfig;
