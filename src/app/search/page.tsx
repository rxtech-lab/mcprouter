import { Suspense } from "react";
import { Header } from "@/components/Header";
import { McpServerCard } from "@/components/McpServerCard";
import { Loader2, AlertCircle } from "lucide-react";
import { searchPublicMcpServers } from "@/lib/db/queries/mcp_queries";

interface SearchPageProps {
  searchParams: { q?: string };
}

async function SearchResults({ query }: { query: string }) {
  if (!query.trim()) {
    return (
      <div className="text-center py-12" data-testid="search-empty-state">
        <p className="text-muted-foreground text-lg">
          Enter a search query to find MCP servers
        </p>
      </div>
    );
  }

  const searchResults = await searchPublicMcpServers({
    query: query.trim(),
    limit: 50,
  });

  if (searchResults.data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No servers found</h3>
          <p className="text-muted-foreground">
            No servers match "{query}". Try different keywords or check your
            spelling.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Results count */}
      <div className="mb-6">
        <p
          data-testid="search-results-count"
          className="text-sm text-muted-foreground"
        >
          Found {searchResults.data.length} server
          {searchResults.data.length !== 1 ? "s" : ""} for "{query}"
        </p>
      </div>

      {/* Server Grid using CSS columns for masonry layout */}
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
        {searchResults.data.map((server) => (
          <div key={server.id} className="break-inside-avoid mb-4">
            <McpServerCard server={server} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Searching servers...</p>
      </div>
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Search Results
          </h1>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <SearchResults query={query} />
        </Suspense>
      </main>
    </div>
  );
}
