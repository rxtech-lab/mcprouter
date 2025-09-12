"use server";

import { signIn } from "@/auth";
import { getUserByEmail } from "@/lib/db/queries/user_queries";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function signInWithEmail(email: string) {
  try {
    await signIn("resend", {
      email,
      redirectTo: "/protected",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Failed to send verification email");
    }
    throw error;
  }
}

export async function signUpWithEmail(email: string) {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser?.emailVerified) {
      throw new Error(
        "An account with this email already exists. Please sign in instead.",
      );
    }

    // If user exists but not verified, we'll send a new verification email
    await signIn("resend", {
      email,
      redirectTo: "/protected",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Failed to send verification email");
    }
    throw error;
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

export async function signInWithPasskey() {
  try {
    await signIn("passkey", { redirectTo: "/protected" });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Failed to sign in with passkey");
    }
    throw error;
  }
}
