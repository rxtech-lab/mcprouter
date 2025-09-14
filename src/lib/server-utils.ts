import "server-only";

import { generateVerificationToken, generateTokenExpiry } from "./auth-utils";
import { createVerificationToken } from "./redis/verification-queries";

export async function getVerificationUrl(email: string) {
  const token = generateVerificationToken();
  const expires = generateTokenExpiry();
  const isPlaywrightTest = process.env.IS_PLAYWRIGHT_TEST === "true";
  if (!isPlaywrightTest) {
    await createVerificationToken(email, token, expires);
  }
  return `${process.env.AUTH_URL}/auth/verify?email=${encodeURIComponent(email)}&token=${token}`;
}
