"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createKey,
  deleteKey,
  type KeyType,
} from "@/lib/db/queries/key_queries";

const createKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  type: z.enum(["user", "server"] as const),
});

const deleteKeySchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createKeyAction(
  type: KeyType,
  formData: FormData,
): Promise<ActionResult<{ id: string; name: string; rawKey: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;

    const validation = createKeySchema.safeParse({ name, type });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const result = await createKey({
      name: validation.data.name,
      type: validation.data.type,
      createdBy: session.user.id,
    });

    revalidatePath(`/dashboard/keys`);

    return {
      success: true,
      data: {
        id: result.key.id,
        name: result.key.name,
        rawKey: result.rawKey,
      },
    };
  } catch (error) {
    console.error("Error creating key:", error);
    return { success: false, error: "Failed to create key" };
  }
}

export async function createMcpKeyAction(
  formData: FormData,
): Promise<ActionResult<{ id: string; name: string; rawKey: string }>> {
  return createKeyAction("user", formData);
}

export async function createServerKeyAction(
  formData: FormData,
): Promise<ActionResult<{ id: string; name: string; rawKey: string }>> {
  return createKeyAction("server", formData);
}

export async function deleteKeyAction(
  formData: FormData,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const id = formData.get("id") as string;

    const validation = deleteKeySchema.safeParse({ id });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const deletedKey = await deleteKey(validation.data.id, session.user.id);

    if (!deletedKey) {
      return { success: false, error: "Key not found or access denied" };
    }

    revalidatePath(`/dashboard/keys`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting key:", error);
    return { success: false, error: "Failed to delete key" };
  }
}
