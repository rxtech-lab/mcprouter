import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { resendVerificationEmail } from "./app/actions/auth";
import { accounts, authenticators, db, users } from "./lib/db";
import { getUserByEmail } from "./lib/db/queries/user_queries";
import { AuthenticatorNotFoundError } from "./lib/errors/auth.error";
import {
  deleteAuthenticationChallenge,
  deleteRegistrationChallenge,
  getAuthenticationChallenge,
  getRegistrationChallenge,
} from "./lib/redis/challenge-queries";

export const { handlers, signIn, auth, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    authenticatorsTable: authenticators,
  }),
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  session: { strategy: "jwt" },
  providers: [
    Google,
    Credentials({
      id: "webauthn-registration",
      name: "WebAuthn Registration",
      credentials: {
        credential: { type: "text" },
        sessionId: { type: "text" },
      },
      async authorize({ credential, sessionId }: any) {
        if (!credential || !sessionId) {
          return null;
        }

        const parsedCredential = JSON.parse(credential);

        // Get challenge from Redis
        const challengeData = await getRegistrationChallenge(sessionId);
        if (!challengeData) {
          return null;
        }

        // Verify the registration response
        const verification = await verifyRegistrationResponse({
          response: parsedCredential,
          expectedChallenge: challengeData.challenge,
          expectedOrigin:
            process.env.WEBAUTHN_ORIGIN || "http://localhost:3000",
          expectedRPID: process.env.WEBAUTHN_RP_ID || "localhost",
        });

        if (!verification.verified || !verification.registrationInfo) {
          return null;
        }

        const { credentialID, credentialPublicKey, counter } =
          verification.registrationInfo;

        // Handle new user signup only
        if (!challengeData.userId || !challengeData.email) {
          return null;
        }

        const existingUser = await getUserByEmail(challengeData.email);
        if (existingUser?.emailVerified) {
          return null; // User already exists
        }

        // Create new user (email verification still required)
        const [newUser] = await db
          .insert(users)
          .values({
            id: challengeData.userId,
            email: challengeData.email,
            emailVerified: null, // Email verification required even for passkey signup
            name: challengeData.email.split("@")[0],
          })
          .returning();

        // Store the authenticator
        await db.insert(authenticators).values({
          credentialID: Buffer.from(credentialID).toString("base64url"),
          userId: newUser.id,
          providerAccountId: crypto.randomUUID(),
          credentialPublicKey:
            Buffer.from(credentialPublicKey).toString("base64url"),
          counter,
          credentialDeviceType: "singleDevice",
          credentialBackedUp: false,
          transports: parsedCredential.response.transports?.join(",") || null,
        });

        // Clean up challenge
        await Promise.allSettled([
          deleteRegistrationChallenge(sessionId),
          resendVerificationEmail(newUser.email!),
        ]);

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          emailVerified: newUser.emailVerified,
          role: newUser.role || "user",
        };
      },
    }),
    Credentials({
      id: "webauthn-authentication",
      name: "WebAuthn Authentication",
      credentials: {
        credential: { type: "text" },
        sessionId: { type: "text" },
      },
      async authorize({ credential, sessionId }: any) {
        if (!credential || !sessionId) {
          return null;
        }

        const parsedCredential = JSON.parse(credential);

        // Get challenge from Redis
        const challengeData = await getAuthenticationChallenge(sessionId);
        if (!challengeData) {
          return null;
        }

        // Find the authenticator
        const credentialID = Buffer.from(
          parsedCredential.rawId,
          "base64url"
        ).toString("base64url");

        const authenticator = await db
          .select({
            credentialID: authenticators.credentialID,
            credentialPublicKey: authenticators.credentialPublicKey,
            counter: authenticators.counter,
            userId: authenticators.userId,
            userEmail: users.email,
            userName: users.name,
            userEmailVerified: users.emailVerified,
            userRole: users.role,
          })
          .from(authenticators)
          .innerJoin(users, eq(authenticators.userId, users.id))
          .where(eq(authenticators.credentialID, credentialID))
          .limit(1);

        if (!authenticator[0]) {
          throw new AuthenticatorNotFoundError();
        }

        const auth = authenticator[0];

        // Verify the authentication response
        const verification = await verifyAuthenticationResponse({
          response: parsedCredential,
          expectedChallenge: challengeData.challenge,
          expectedOrigin:
            process.env.WEBAUTHN_ORIGIN || "http://localhost:3000",
          expectedRPID: process.env.WEBAUTHN_RP_ID || "localhost",
          authenticator: {
            credentialID: Buffer.from(auth.credentialID, "base64url"),
            credentialPublicKey: Buffer.from(
              auth.credentialPublicKey,
              "base64url"
            ),
            counter: auth.counter,
          },
        });

        if (!verification.verified) {
          return null;
        }

        // Update counter
        if (verification.authenticationInfo?.newCounter !== undefined) {
          await db
            .update(authenticators)
            .set({ counter: verification.authenticationInfo.newCounter })
            .where(eq(authenticators.credentialID, credentialID));
        }

        // Clean up challenge
        await deleteAuthenticationChallenge(sessionId);

        return {
          id: auth.userId,
          email: auth.userEmail,
          name: auth.userName,
          emailVerified: auth.userEmailVerified,
          role: auth.userRole || "user",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("signIn", user, account);
      // Check email verification for existing users
      if (user?.email) {
        const existingUser = await getUserByEmail(user.email);
        if (existingUser && !existingUser.emailVerified) {
          // Redirect to error page with EmailNotVerified error
          return `/auth/error?error=EmailNotVerified&email=${user.email}`;
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = user.emailVerified;
        token.role = user.role || "user";
      }
      return token;
    },
    session({ session, user, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.role = (token.role as string) || "user";
      }

      return session;
    },
  },
});
