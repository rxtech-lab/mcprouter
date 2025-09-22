"use client";

import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Masonry from "@mui/lab/Masonry";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { McpServerCard } from "./McpServerCard";
import {
  getPublicMcpServers,
  searchPublicMcpServers,
} from "@/app/actions/mcp-actions";
import type { PaginatedMcpServers } from "@/lib/db/queries/mcp_queries";

interface McpServerGridProps {
  searchQuery?: string;
  category?: string;
  initialData?: PaginatedMcpServers;
}

export function McpServerGrid({
  searchQuery,
  category,
  initialData,
}: McpServerGridProps) {
  const [isSearching, setIsSearching] = useState(false);

  // Determine if we're searching or just listing
  const isSearch = Boolean(searchQuery?.trim());

  // Query function based on search state
  const queryFn = useCallback(
    async ({ pageParam }: { pageParam?: string }) => {
      if (isSearch && searchQuery) {
        return await searchPublicMcpServers({
          query: searchQuery,
          category: category as any,
          cursor: pageParam,
          limit: 20,
        });
      } else {
        return await getPublicMcpServers({
          category: category as any,
          cursor: pageParam,
          limit: 20,
        });
      }
    },
    [isSearch, searchQuery, category],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["mcpServers", searchQuery, category],
    queryFn,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
  });

  // Handle search state
  useEffect(() => {
    if (isSearch) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isSearch, searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Collect all servers from all pages
  const servers = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading || isSearching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {isSearching ? "Searching servers..." : "Loading servers..."}
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-4">
            {error instanceof Error ? error.message : "Failed to load servers"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="text-center"
          data-testid={isSearch ? "search-no-results" : "no-servers"}
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No servers found</h3>
          <p className="text-muted-foreground">
            {isSearch
              ? `No servers match "${searchQuery}"`
              : "No MCP servers are available at the moment"}
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
          data-testid="servers-count"
          className="text-sm text-muted-foreground"
        >
          {isSearch
            ? `Found ${servers.length} server${servers.length !== 1 ? "s" : ""} for "${searchQuery}"`
            : `${servers.length} server${servers.length !== 1 ? "s" : ""} available`}
        </p>
      </div>

      {/* Masonry Grid */}
      <Masonry
        columns={{
          lg: 4,
          md: 3,
          sm: 2,
          xs: 1,
        }}
      >
        <AnimatePresence mode="popLayout">
          {servers.map((server, index) => (
            <motion.div
              key={server.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05, // Stagger animation
              }}
              className="mb-4"
              style={{
                minHeight: `${200 + (index % 2) * 50}px`,
              }}
            >
              <McpServerCard server={server} />
            </motion.div>
          ))}
        </AnimatePresence>
      </Masonry>

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading more servers...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
