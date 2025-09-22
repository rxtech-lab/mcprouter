import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, keys, users } from "@/lib/db";
import { hashKey } from "@/lib/db/queries/key_queries";

const sessionRequestSchema = z.object({
  userKey: z.string().min(1, "User key is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Extract server key from x-api-key header
    const serverKey = request.headers.get("x-api-key");
    if (!serverKey) {
      return NextResponse.json(
        { error: "Server key is required in x-api-key header" },
        { status: 401 },
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = sessionRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { userKey } = validationResult.data;
    const hashedServerKey = hashKey(serverKey);

    // Validate server key
    const [serverKeyRecord] = await db
      .select()
      .from(keys)
      .where(eq(keys.value, hashedServerKey))
      .limit(1);

    if (!serverKeyRecord || serverKeyRecord.type !== "server") {
      return NextResponse.json(
        { error: "Invalid server key" },
        { status: 401 },
      );
    }

    // Validate user key and get associated user
    const [userKeyRecord] = await db
      .select({
        keyId: keys.id,
        keyType: keys.type,
        createdBy: keys.createdBy,
      })
      .from(keys)
      .where(eq(keys.value, userKey))
      .limit(1);

    if (!userKeyRecord || userKeyRecord.keyType !== "user") {
      return NextResponse.json({ error: "Invalid user key" }, { status: 401 });
    }

    // Get user data
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .where(eq(users.id, userKeyRecord.createdBy))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Return user data
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("MCP session authentication error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
