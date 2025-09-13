import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { storeRegistrationChallenge } from "@/lib/redis/challenge-queries";
import { getUserByEmail } from "@/lib/db/queries/user_queries";
import { auth } from "@/auth";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, mode, passkeyName } = await request.json();

    // Validate mode
    if (!["signup", "add-passkey"].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid mode. Must be 'signup' or 'add-passkey'" },
        { status: 400 },
      );
    }

    let userId: string | undefined;

    if (mode === "add-passkey") {
      // For adding passkey to existing user, require authentication
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Authentication required for adding passkey" },
          { status: 401 },
        );
      }
      userId = session.user.id;
    } else if (mode === "signup") {
      // For signup, check if user already exists
      if (!email) {
        return NextResponse.json(
          { error: "Email is required for signup" },
          { status: 400 },
        );
      }

      const existingUser = await getUserByEmail(email);
      if (existingUser?.emailVerified) {
        return NextResponse.json(
          { error: "User already exists with this email" },
          { status: 400 },
        );
      }

      // Generate a temporary user ID for signup
      userId = randomUUID();
    }

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: "MCRouter Website",
      rpID: process.env.WEBAUTHN_RP_ID || "localhost",
      userID: userId!,
      userName: email || passkeyName || "User",
      userDisplayName: email || passkeyName || "User",
      attestationType: "none",
      excludeCredentials: [], // TODO: Add existing credentials for user
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
    });

    // Generate session ID
    const sessionId = randomUUID();

    // Store challenge in Redis
    await storeRegistrationChallenge(sessionId, {
      challenge: options.challenge,
      options,
      userId: mode === "signup" ? userId : undefined,
      email: mode === "signup" ? email : undefined,
      passkeyName: mode === "add-passkey" ? passkeyName : undefined,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      options,
      sessionId,
    });
  } catch (error) {
    console.error("WebAuthn registration begin error:", error);
    return NextResponse.json(
      { error: "Failed to begin registration" },
      { status: 500 },
    );
  }
}
