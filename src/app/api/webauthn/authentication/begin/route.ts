import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { storeAuthenticationChallenge } from "@/lib/redis/challenge-queries";
import { db } from "@/lib/db";
import { authenticators, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Get user's specific passkeys if email provided
    let allowCredentials:
      | Array<{ id: BufferSource; type: "public-key" }>
      | undefined;

    if (email) {
      // If email provided, get user's specific passkeys
      const userAuthenticators = await db
        .select({
          credentialID: authenticators.credentialID,
        })
        .from(authenticators)
        .innerJoin(users, eq(authenticators.userId, users.id))
        .where(eq(users.email, email));

      allowCredentials = userAuthenticators.map((auth) => ({
        id: Buffer.from(auth.credentialID, "base64url"),
        type: "public-key" as const,
      }));
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID: process.env.WEBAUTHN_RP_ID || "localhost",
      allowCredentials,
      userVerification: "preferred",
    });

    // Generate session ID
    const sessionId = randomUUID();

    // Store challenge in Redis
    await storeAuthenticationChallenge(sessionId, {
      challenge: options.challenge,
      options,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      options,
      sessionId,
    });
  } catch (error) {
    console.error("WebAuthn authentication begin error:", error);
    return NextResponse.json(
      { error: "Failed to begin authentication" },
      { status: 500 },
    );
  }
}
