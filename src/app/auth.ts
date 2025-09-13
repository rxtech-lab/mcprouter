"use server";

import { auth, signIn } from "@/auth";
import { getUserByEmail } from "@/lib/db/queries/user_queries";
import { getAuthenticatorsByUserId } from "@/lib/db/queries/authenticator_queries";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  generateVerificationToken,
  generateTokenExpiry,
} from "@/lib/auth-utils";
import {
  createVerificationToken,
  getVerificationToken,
  deleteVerificationToken,
  isTokenExpired,
} from "@/lib/redis/verification-queries";
import { sendVerificationEmail } from "@/lib/email";
import { config } from "@/config/config";

export async function signInWithEmail(email: string) {
  try {
    // Check if user exists and is verified
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      throw new Error("No account found with this email address");
    }

    if (!existingUser.emailVerified) {
      throw new Error("Please verify your email address first");
    }

    // Generate verification token
    const token = generateVerificationToken();
    const expires = generateTokenExpiry();

    // Store token in Redis
    await createVerificationToken(email, token, expires);

    // Create verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?email=${encodeURIComponent(email)}&token=${token}`;

    // Send verification email
    await sendVerificationEmail(email, verificationUrl);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to send verification email");
  }
}

export async function signUpWithEmail(email: string) {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser?.emailVerified) {
      throw new Error(
        "An account with this email already exists. Please sign in instead."
      );
    }

    // Generate verification token
    const token = generateVerificationToken();
    const expires = generateTokenExpiry();

    // Store token in Redis
    await createVerificationToken(email, token, expires);

    // Create verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?email=${encodeURIComponent(email)}&token=${token}`;

    // Send verification email for signup
    await sendVerificationEmail(email, verificationUrl);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to send verification email");
  }
}

export async function signInWithGoogle() {
  try {
    await signIn("google", { redirectTo: "/protected" });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Failed to sign in with Google");
    }
    throw error;
  }
}

export async function verifyEmailToken(token: string) {
  try {
    // Get the verification token from Redis
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("User does not have an email");
    }
    const email = session.user.email;
    const verificationToken = await getVerificationToken(email, token);

    if (!verificationToken) {
      throw new Error("Invalid or expired verification token");
    }

    // Check if token is expired
    if (isTokenExpired(new Date(verificationToken.expires))) {
      // Clean up expired token
      await deleteVerificationToken(email, token);
      throw new Error("Verification token has expired");
    }

    // Get user by email
    const user = await getUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    // Mark email as verified
    await db
      .update(users)
      .set({
        emailVerified: new Date(),
        lastVerificationEmailSent: null,
      })
      .where(eq(users.email, email));

    // Clean up the used token
    await deleteVerificationToken(email, token);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to verify email token");
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("User does not have an email");
    }
    const user = await getUserByEmail(session?.user?.email!);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.emailVerified) {
      throw new Error("Email is already verified");
    }

    // Check if last email was sent within cooldown period
    if (user.lastVerificationEmailSent) {
      const timeSinceLastEmail =
        Date.now() - user.lastVerificationEmailSent.getTime();
      const cooldownMs = config.auth.resendCooldownSeconds * 1000;

      if (timeSinceLastEmail < cooldownMs) {
        const remainingSeconds = Math.ceil(
          (cooldownMs - timeSinceLastEmail) / 1000
        );
        throw new Error(
          `Please wait ${remainingSeconds} seconds before requesting another email`
        );
      }
    }

    // Update last verification email sent timestamp
    await db
      .update(users)
      .set({ lastVerificationEmailSent: new Date() })
      .where(eq(users.email, email));

    // Generate new verification token
    const token = generateVerificationToken();
    const expires = generateTokenExpiry();

    // Store token in Redis
    await createVerificationToken(email, token, expires);

    // Create verification URL
    const verificationUrl = `${process.env.AUTH_URL}/auth/verify?email=${encodeURIComponent(email)}&token=${token}`;

    // Send verification email
    await sendVerificationEmail(email, verificationUrl);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to send verification email");
  }
}

export async function checkEmailVerificationStatus(email: string) {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return { isVerified: false };
    }

    return { isVerified: !!user.emailVerified };
  } catch (error) {
    console.error("Error checking email verification status:", error);
    return { isVerified: false };
  }
}

/**
 * Get list of the authenticators base on the current signed in user
 */
export async function getAuthenticators() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  return await getAuthenticatorsByUserId(session.user.id);
}
