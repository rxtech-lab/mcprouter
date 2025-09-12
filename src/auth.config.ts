import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Passkey from "next-auth/providers/passkey";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    Google,
    Resend({
      from: process.env.AUTH_RESEND_FROM,
    }),
    Passkey,
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith("/protected");

      if (isProtected) {
        if (!isLoggedIn) return false;

        if (!auth.user.emailVerified) {
          const url = nextUrl.clone();
          url.pathname = "/auth/signin";
          url.searchParams.set("error", "EmailNotVerified");
          return Response.redirect(url);
        }
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
