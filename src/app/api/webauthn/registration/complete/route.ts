import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import {
  getRegistrationChallenge,
  deleteRegistrationChallenge,
} from "@/lib/redis/challenge-queries";
import { db } from "@/lib/db";
import { authenticators } from "@/lib/db/schema";
import { auth } from "@/auth";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { credential, sessionId } = await request.json();

    if (!credential || !sessionId) {
      return NextResponse.json(
        { error: "Missing credential or sessionId" },
        { status: 400 },
      );
    }

    // Get challenge from Redis
    const challengeData = await getRegistrationChallenge(sessionId);
    if (!challengeData) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 400 },
      );
    }

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: process.env.WEBAUTHN_ORIGIN || "http://localhost:3000",
      expectedRPID: process.env.WEBAUTHN_RP_ID || "localhost",
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: "Failed to verify credential" },
        { status: 400 },
      );
    }

    const { credentialID, credentialPublicKey, counter } =
      verification.registrationInfo;

    // This route only handles adding passkeys to existing authenticated users
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    const userId = session.user.id;

    // Store the authenticator
    await db.insert(authenticators).values({
      credentialID: Buffer.from(credentialID).toString("base64url"),
      userId,
      providerAccountId: randomUUID(),
      credentialPublicKey:
        Buffer.from(credentialPublicKey).toString("base64url"),
      counter,
      credentialDeviceType: "singleDevice", // Default for now
      credentialBackedUp: false,
      transports: credential.response.transports?.join(",") || null,
    });

    // Clean up challenge
    await deleteRegistrationChallenge(sessionId);

    return NextResponse.json({
      verified: true,
      message: "Passkey added successfully",
    });
  } catch (error) {
    console.error("WebAuthn registration complete error:", error);
    return NextResponse.json(
      { error: "Failed to complete registration" },
      { status: 500 },
    );
  }
}
