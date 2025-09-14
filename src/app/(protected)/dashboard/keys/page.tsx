import { auth } from "@/auth";
import { listKeys } from "@/lib/db/queries/key_queries";
import { redirect } from "next/navigation";
import { KeysPageClient } from "./components/KeysPageClient";

interface SearchParams {
  tab?: string;
  cursor?: string;
}

export default async function KeysPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const params = await searchParams;
  const activeTab = params.tab === "server" ? "server" : "mcp";
  const cursor = params.cursor;

  // Fetch both MCP and server keys
  const [mcpKeys, serverKeys] = await Promise.all([
    listKeys({
      userId: session.user.id,
      type: "user", // MCP keys are stored as "user" type
      cursor: activeTab === "mcp" ? cursor : undefined,
      limit: 10,
    }),
    listKeys({
      userId: session.user.id,
      type: "server",
      cursor: activeTab === "server" ? cursor : undefined,
      limit: 10,
    }),
  ]);

  return (
    <KeysPageClient initialMcpKeys={mcpKeys} initialServerKeys={serverKeys} />
  );
}
