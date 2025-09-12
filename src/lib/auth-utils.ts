import crypto from "crypto";
import { config } from "@/config/config";

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateTokenExpiry(
  minutes: number = config.auth.verificationTokenExpiryMinutes,
): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isTokenExpired(expires: Date): boolean {
  return new Date() > expires;
}
