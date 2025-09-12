import { redis, REDIS_KEYS, REDIS_TTL } from "./index";
import type { EmailVerificationToken } from "./types";

export async function createVerificationToken(
  email: string,
  token: string,
  expires: Date,
): Promise<void> {
  const key = REDIS_KEYS.EMAIL_VERIFICATION(email);
  const tokenData: EmailVerificationToken = {
    token,
    email,
    expires: expires.getTime(),
    timestamp: Date.now(),
  };

  await redis.setex(key, REDIS_TTL.EMAIL_VERIFICATION, tokenData);
}

export async function getVerificationToken(
  email: string,
  token: string,
): Promise<EmailVerificationToken | null> {
  const key = REDIS_KEYS.EMAIL_VERIFICATION(email);
  const data = (await redis.get(key)) as EmailVerificationToken | null;

  if (!data || data.token !== token) {
    return null;
  }

  return data;
}

export async function deleteVerificationToken(
  email: string,
  token?: string,
): Promise<void> {
  const key = REDIS_KEYS.EMAIL_VERIFICATION(email);

  // If token is provided, verify it matches before deleting
  if (token) {
    const data = (await redis.get(key)) as EmailVerificationToken | null;
    if (!data || data.token !== token) {
      return; // Don't delete if token doesn't match
    }
  }

  await redis.del(key);
}

export function isTokenExpired(expires: Date): boolean {
  return Date.now() > expires.getTime();
}
