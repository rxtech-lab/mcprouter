import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/types";

export interface WebAuthnRegistrationChallenge {
  challenge: string;
  options: PublicKeyCredentialCreationOptionsJSON;
  userId?: string; // For adding passkey to existing user
  email?: string; // For new user registration
  passkeyName?: string; // For custom passkey names
  timestamp: number;
}

export interface WebAuthnAuthenticationChallenge {
  challenge: string;
  options: PublicKeyCredentialRequestOptionsJSON;
  timestamp: number;
}

export interface EmailVerificationToken {
  token: string;
  email: string;
  expires: number;
  timestamp: number;
}

export type ChallengeType = "registration" | "authentication";

export interface ChallengeMetadata {
  type: ChallengeType;
  sessionId: string;
  createdAt: number;
}
