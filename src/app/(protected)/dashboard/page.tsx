import { auth } from "@/auth";
import {
  listMcpServers,
  searchMcpServers,
  listMcpServersByCategory,
} from "@/lib/db/queries/mcp_queries";
import { redirect } from "next/navigation";
import { McpServersPageClient } from "./components/McpServersPageClient";
import { categories } from "@/config/categories";

interface SearchParams {
  category?: string;
  search?: string;
  location?: string;
  auth?: string;
  sort?: string;
  cursor?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin/oidc?callbackUrl=/dashboard");
  }

  const params = await searchParams;
  const { category, search, cursor } = params;

  const limit = 12; // Show more servers per page for grid layout

  // Base query options
  const baseOptions = {
    userId: session.user.id,
    cursor,
    limit,
  };

  // Fetch servers based on filters
  let servers;
  if (search) {
    // Search across all servers
    servers = await searchMcpServers({
      ...baseOptions,
      query: search,
      category: category as any,
    });
  } else if (category && category !== "all") {
    // Filter by specific category
    servers = await listMcpServersByCategory(
      session.user.id,
      category as any,
      cursor,
      limit,
    );
  } else {
    // List all servers
    servers = await listMcpServers({
      ...baseOptions,
      category: category as any,
    });
  }

  // Fetch servers by category for tab counts (simplified for now)
  const serversByCategory: Record<string, any> = {};

  // For performance, we'll fetch category counts in parallel but with smaller limits
  await Promise.all(
    categories.map(async (cat) => {
      try {
        const categoryServers = await listMcpServersByCategory(
          session.user.id,
          cat as any,
          undefined,
          limit,
        );
        serversByCategory[cat] = categoryServers;
      } catch (error) {
        console.error(`Error fetching ${cat} servers:`, error);
        serversByCategory[cat] = { data: [], hasMore: false };
      }
    }),
  );

  return (
    <McpServersPageClient
      servers={servers}
      serversByCategory={serversByCategory}
    />
  );
}
