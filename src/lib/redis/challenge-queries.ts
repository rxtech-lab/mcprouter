import { redis, REDIS_KEYS, REDIS_TTL } from "./index";
import type {
  WebAuthnRegistrationChallenge,
  WebAuthnAuthenticationChallenge,
} from "./types";

export async function storeRegistrationChallenge(
  sessionId: string,
  challengeData: WebAuthnRegistrationChallenge,
): Promise<void> {
  const key = REDIS_KEYS.WEBAUTHN_REG_CHALLENGE(sessionId);
  await redis.setex(key, REDIS_TTL.WEBAUTHN_CHALLENGE, challengeData);
}

export async function getRegistrationChallenge(
  sessionId: string,
): Promise<WebAuthnRegistrationChallenge | null> {
  const key = REDIS_KEYS.WEBAUTHN_REG_CHALLENGE(sessionId);
  const data = await redis.get(key);
  return data as WebAuthnRegistrationChallenge | null;
}

export async function deleteRegistrationChallenge(
  sessionId: string,
): Promise<void> {
  const key = REDIS_KEYS.WEBAUTHN_REG_CHALLENGE(sessionId);
  await redis.del(key);
}

export async function storeAuthenticationChallenge(
  sessionId: string,
  challengeData: WebAuthnAuthenticationChallenge,
): Promise<void> {
  const key = REDIS_KEYS.WEBAUTHN_AUTH_CHALLENGE(sessionId);
  await redis.setex(key, REDIS_TTL.WEBAUTHN_CHALLENGE, challengeData);
}

export async function getAuthenticationChallenge(
  sessionId: string,
): Promise<WebAuthnAuthenticationChallenge | null> {
  const key = REDIS_KEYS.WEBAUTHN_AUTH_CHALLENGE(sessionId);
  const data = await redis.get(key);
  return data as WebAuthnAuthenticationChallenge | null;
}

export async function deleteAuthenticationChallenge(
  sessionId: string,
): Promise<void> {
  const key = REDIS_KEYS.WEBAUTHN_AUTH_CHALLENGE(sessionId);
  await redis.del(key);
}
