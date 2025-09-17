"use server";

import { auth, signOut } from "@/auth";
import {
  createMcpServer,
  deleteMcpServer,
  updateMcpServer,
  type McpServerCategory,
} from "@/lib/db/queries/mcp_queries";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function handleSignOut() {
  await signOut();
}

// Zod schemas for validation
const socialLinksSchema = z
  .object({
    website: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    discord: z.string().url().optional().or(z.literal("")),
    telegram: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
    facebook: z.string().url().optional().or(z.literal("")),
    pinterest: z.string().url().optional().or(z.literal("")),
    reddit: z.string().url().optional().or(z.literal("")),
    tiktok: z.string().url().optional().or(z.literal("")),
    twitch: z.string().url().optional().or(z.literal("")),
    vimeo: z.string().url().optional().or(z.literal("")),
  })
  .optional();

const downloadLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  link: z.string().url("Must be a valid URL"),
});

const imageStructureSchema = z
  .object({
    cover: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    icon: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  })
  .optional();

const createMcpServerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z
    .string()
    .max(500, "Description too long")
    .optional()
    .or(z.literal("")),
  url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .transform((val) => (val === null ? "" : val)),
  version: z
    .string()
    .min(1, "Version is required")
    .optional()
    .or(z.null())
    .transform((val) => (val === null ? undefined : val)),
  github: z
    .string()
    .url("Must be a valid GitHub URL")
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .transform((val) => (val === null ? "" : val)),
  socialLinks: socialLinksSchema,
  downloadLinks: z.array(downloadLinkSchema).optional(),
  locationType: z.array(z.enum(["remote", "local"])).optional(),
  category: z
    .enum([
      "crypto",
      "finance",
      "language",
      "networking",
      "security",
      "storage",
    ])
    .optional(),
  tags: z.array(z.string()).optional(),
  image: imageStructureSchema,
  authenticationMethods: z
    .array(z.enum(["none", "apiKey", "oauth"]))
    .default(["none"]),
  isPublic: z.boolean().default(true),
});

const updateMcpServerSchema = createMcpServerSchema
  .partial()
  .omit({ version: true });

const deleteMcpServerSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createMcpServerAction(
  formData: FormData,
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Parse form data
    const rawData = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || "", // Default to empty string if not provided
      url: formData.get("url") as string,
      version: formData.get("version") as string,
      github: formData.get("github") as string,
      category: formData.get("category") as McpServerCategory,
      isPublic: formData.get("isPublic") === "true",
      // Parse JSON fields
      socialLinks: formData.get("socialLinks")
        ? JSON.parse(formData.get("socialLinks") as string)
        : undefined,
      downloadLinks: formData.get("downloadLinks")
        ? JSON.parse(formData.get("downloadLinks") as string)
        : undefined,
      locationType: formData.get("locationType")
        ? JSON.parse(formData.get("locationType") as string)
        : undefined,
      tags: formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : undefined,
      image: formData.get("image")
        ? JSON.parse(formData.get("image") as string)
        : undefined,
      authenticationMethods: formData.get("authenticationMethods")
        ? JSON.parse(formData.get("authenticationMethods") as string)
        : ["none"],
    };

    const validation = createMcpServerSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const result = await createMcpServer({
      ...validation.data,
      createdBy: session.user.id,
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        id: result.id,
        name: result.name,
      },
    };
  } catch (error) {
    console.error("Error creating MCP server:", error);
    return { success: false, error: "Failed to create MCP server" };
  }
}

export async function updateMcpServerAction(
  formData: FormData,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const id = formData.get("id") as string;

    // Parse form data (similar to create but partial)
    const rawData = {
      name: (formData.get("name") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      url: (formData.get("url") as string) || undefined,
      github: (formData.get("github") as string) || undefined,
      category: (formData.get("category") as McpServerCategory) || undefined,
      isPublic: formData.has("isPublic")
        ? formData.get("isPublic") === "true"
        : undefined,
      socialLinks: formData.get("socialLinks")
        ? JSON.parse(formData.get("socialLinks") as string)
        : undefined,
      downloadLinks: formData.get("downloadLinks")
        ? JSON.parse(formData.get("downloadLinks") as string)
        : undefined,
      locationType: formData.get("locationType")
        ? JSON.parse(formData.get("locationType") as string)
        : undefined,
      tags: formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : undefined,
      image: formData.get("image")
        ? JSON.parse(formData.get("image") as string)
        : undefined,
      authenticationMethods: formData.get("authenticationMethods")
        ? JSON.parse(formData.get("authenticationMethods") as string)
        : undefined,
    };

    const validation = updateMcpServerSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const result = await updateMcpServer(id, session.user.id, validation.data);

    if (!result) {
      return { success: false, error: "MCP server not found or access denied" };
    }

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating MCP server:", error);
    return { success: false, error: "Failed to update MCP server" };
  }
}

export async function deleteMcpServerAction(
  formData: FormData,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const id = formData.get("id") as string;

    const validation = deleteMcpServerSchema.safeParse({ id });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.map((e) => e.message).join(", "),
      };
    }

    const result = await deleteMcpServer(validation.data.id, session.user.id);

    if (!result) {
      return { success: false, error: "MCP server not found or access denied" };
    }

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting MCP server:", error);
    return { success: false, error: "Failed to delete MCP server" };
  }
}

export async function toggleMcpServerPublicStatusAction(
  formData: FormData,
): Promise<ActionResult<void>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const id = formData.get("id") as string;
    const isPublic = formData.get("isPublic") === "true";

    const result = await updateMcpServer(id, session.user.id, {
      isPublic: !isPublic,
    });

    if (!result) {
      return { success: false, error: "MCP server not found or access denied" };
    }

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error toggling MCP server public status:", error);
    return { success: false, error: "Failed to update MCP server status" };
  }
}
