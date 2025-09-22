import { Suspense } from "react";
import { McpServerGrid } from "@/components/McpServerGrid";
import { CategoryFilter } from "@/components/CategoryFilter";
import { AnimatedSection } from "@/components/AnimatedSection";
import { getPublicMcpServers } from "@/app/actions/mcp-actions";
import { Loader2 } from "lucide-react";

interface HomePageProps {
  searchParams: Promise<{ category?: string }>;
}

async function ServerGridWithData({ category }: { category?: string }) {
  const initialData = await getPublicMcpServers({
    category: category as any,
    limit: 20,
  });

  return <McpServerGrid initialData={initialData} category={category} />;
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Loading servers...</p>
      </div>
    </div>
  );
}

export default async function Home({ searchParams }: HomePageProps) {
  const { category } = await searchParams;

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <AnimatedSection className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
            Discover MCP Servers
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Explore a curated collection of Model Context Protocol servers. Find
            the perfect tools to enhance your AI applications.
          </p>
        </AnimatedSection>

        {/* Category Filter */}
        <AnimatedSection className="mb-8" delay={0.1}>
          <CategoryFilter selectedCategory={category} />
        </AnimatedSection>

        {/* Server Grid */}
        <AnimatedSection delay={0.2}>
          <Suspense fallback={<LoadingSkeleton />}>
            <ServerGridWithData category={category} />
          </Suspense>
        </AnimatedSection>
      </main>
    </div>
  );
}
