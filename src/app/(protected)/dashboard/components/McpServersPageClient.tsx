"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateMcpServerForm } from "@/components/mcp/CreateMcpServerForm";
import { FilterBar } from "@/components/mcp/FilterBar";
import { McpServerCard } from "@/components/mcp/McpServerCard";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ServerIcon,
  Bitcoin,
  DollarSign,
  Globe,
  Network,
  Shield,
  Database,
} from "lucide-react";

interface McpServer {
  id: string;
  name: string;
  url?: string | null;
  version: string;
  description?: string | null;
  github?: string | null;
  category?: string | null;
  tags?: string[] | null;
  locationType?: string[] | null;
  authenticationMethods: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginatedMcpServers {
  data: McpServer[];
  nextCursor?: string;
  hasMore: boolean;
}

interface McpServersPageClientProps {
  servers: PaginatedMcpServers;
  serversByCategory: Record<string, PaginatedMcpServers>;
}

const categories = [
  {
    value: "all",
    label: "All Servers",
    icon: ServerIcon,
    color: "text-gray-600",
  },
  { value: "crypto", label: "Crypto", icon: Bitcoin, color: "text-orange-600" },
  {
    value: "finance",
    label: "Finance",
    icon: DollarSign,
    color: "text-green-600",
  },
  { value: "language", label: "Language", icon: Globe, color: "text-blue-600" },
  {
    value: "networking",
    label: "Networking",
    icon: Network,
    color: "text-purple-600",
  },
  { value: "security", label: "Security", icon: Shield, color: "text-red-600" },
  {
    value: "storage",
    label: "Storage",
    icon: Database,
    color: "text-gray-600",
  },
];

export function McpServersPageClient({
  servers,
  serversByCategory,
}: McpServersPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<McpServer | null>(null);

  // Initialize state from URL params
  useEffect(() => {
    const category = searchParams.get("category");
    if (category && categories.find((c) => c.value === category)) {
      setActiveCategory(category);
    } else {
      setActiveCategory("all");
    }
  }, [searchParams]);

  // Update URL when category changes
  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);

    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    params.delete("cursor"); // Reset cursor when changing categories
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleCreateServer = () => {
    setEditingServer(null);
    setCreateDialogOpen(true);
  };

  const handleEditServer = (server: McpServer) => {
    setEditingServer(server);
    setCreateDialogOpen(true);
  };

  const handlePagination = (direction: "next" | "prev") => {
    const params = new URLSearchParams(searchParams);
    const currentServers =
      activeCategory === "all" ? servers : serversByCategory[activeCategory];

    if (direction === "next" && currentServers?.nextCursor) {
      params.set("cursor", currentServers.nextCursor);
    } else if (direction === "prev") {
      params.delete("cursor");
    }

    router.push(`/dashboard?${params.toString()}`);
  };

  // Get current servers data based on active category
  const currentServers =
    activeCategory === "all"
      ? servers
      : serversByCategory[activeCategory] || { data: [], hasMore: false };

  const renderServerGrid = (serversData: McpServer[]) => {
    if (serversData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <ServerIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No servers found</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {activeCategory === "all"
              ? "Get started by creating your first MCP server"
              : `No servers in the ${activeCategory} category yet`}
          </p>
          <Button onClick={handleCreateServer}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create MCP Server
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serversData.map((server) => (
            <McpServerCard
              key={server.id}
              server={server}
              onEdit={handleEditServer}
            />
          ))}
        </div>

        {/* Pagination */}
        {(searchParams.get("cursor") || currentServers.hasMore) && (
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => handlePagination("prev")}
              disabled={!searchParams.get("cursor")}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {serversData.length} server{serversData.length !== 1 ? "s" : ""}{" "}
              shown
            </span>

            <Button
              variant="outline"
              onClick={() => handlePagination("next")}
              disabled={!currentServers.hasMore}
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MCP Servers</h1>
          <p className="text-muted-foreground">
            Manage your Model Context Protocol servers
          </p>
        </div>
        <Button onClick={handleCreateServer}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Server
        </Button>
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Category:</span>
        <Select value={activeCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => {
              const Icon = category.icon;
              const count =
                category.value === "all"
                  ? servers.data.length
                  : serversByCategory[category.value]?.data.length || 0;

              return (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${category.color}`} />
                    <span>{category.label}</span>
                    {count > 0 && (
                      <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                        {count}
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Filter Bar */}
      <FilterBar totalServers={currentServers.data.length} />

      {/* Server Grid */}
      <div className="mt-6">
        {renderServerGrid(
          activeCategory === "all"
            ? servers.data
            : serversByCategory[activeCategory]?.data || [],
        )}
      </div>

      {/* Create/Edit Dialog */}
      <CreateMcpServerForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        editingServer={editingServer || undefined}
      />
    </div>
  );
}
