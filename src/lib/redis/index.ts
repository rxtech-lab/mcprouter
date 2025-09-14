import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const REDIS_KEYS = {
  WEBAUTHN_REG_CHALLENGE: (sessionId: string) => `webauthn:reg:${sessionId}`,
  WEBAUTHN_AUTH_CHALLENGE: (sessionId: string) => `webauthn:auth:${sessionId}`,
  EMAIL_VERIFICATION: (email: string) => `verify:email:${email}`,
} as const;

export const REDIS_TTL = {
  WEBAUTHN_CHALLENGE: 300, // 5 minutes
  EMAIL_VERIFICATION: 86400, // 24 hours
} as const;
