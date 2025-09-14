import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateVerificationToken, generateTokenExpiry } from "./auth-utils";
import { createVerificationToken } from "./redis/verification-queries";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getVerificationUrl(email: string) {
  const token = generateVerificationToken();
  const expires = generateTokenExpiry();
  // Store token in Redis
  if (process.env.NODE_ENV !== "test") {
    await createVerificationToken(email, token, expires);
  }
  return `${process.env.NEXTAUTH_URL}/auth/verify?email=${encodeURIComponent(email)}&token=${token}`;
}
