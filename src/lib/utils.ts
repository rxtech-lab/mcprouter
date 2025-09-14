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
  const isPlaywrightTest = process.env.IS_PLAYWRIGHT_TEST === "true";
  if (!isPlaywrightTest) {
    await createVerificationToken(email, token, expires);
  }
  return `${process.env.AUTH_URL}/auth/verify?email=${encodeURIComponent(email)}&token=${token}`;
}
