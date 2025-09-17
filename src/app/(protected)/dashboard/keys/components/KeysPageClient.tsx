"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateKeyForm } from "@/components/keys/CreateKeyForm";
import { ViewKeyDialog } from "@/components/keys/ViewKeyDialog";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PlusIcon,
  TrashIcon,
  KeyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "lucide-react";
import { deleteKeyAction, viewKeyAction } from "../actions";

interface Key {
  id: string;
  name: string;
  type: "user" | "server";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginatedKeys {
  data: Key[];
  nextCursor?: string;
  hasMore: boolean;
}

interface KeysPageClientProps {
  initialMcpKeys: PaginatedKeys;
  initialServerKeys: PaginatedKeys;
}

export function KeysPageClient({
  initialMcpKeys,
  initialServerKeys,
}: KeysPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"mcp" | "server">("mcp");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createKeyType, setCreateKeyType] = useState<"mcp" | "server">("mcp");
  const [viewKeyDialogOpen, setViewKeyDialogOpen] = useState(false);
  const [viewingKey, setViewingKey] = useState<{
    id: string;
    name: string;
    value: string;
    type: string;
  } | null>(null);

  // Initialize state from URL params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "server") {
      setActiveTab("server");
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const newTab = value as "mcp" | "server";
    setActiveTab(newTab);

    const params = new URLSearchParams(searchParams);
    params.set("tab", newTab);
    params.delete("cursor"); // Reset cursor when changing tabs
    router.push(`/dashboard/keys?${params.toString()}`);
  };

  const handleCreateKey = (keyType: "mcp" | "server") => {
    setCreateKeyType(keyType);
    setCreateDialogOpen(true);
  };

  const handleDeleteKey = async (keyId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this key? This action cannot be undone.",
      )
    ) {
      return;
    }

    const formData = new FormData();
    formData.append("id", keyId);

    const result = await deleteKeyAction(formData);
    if (result.success) {
      // Refresh the page to show updated data
      router.refresh();
    } else {
      alert(result.error || "Failed to delete key");
    }
  };

  const handleViewKey = async (keyId: string, keyName: string) => {
    const formData = new FormData();
    formData.append("id", keyId);

    const result = await viewKeyAction(formData);
    if (result.success && result.data) {
      setViewingKey(result.data);
      setViewKeyDialogOpen(true);
    } else {
      alert(result.error || "Failed to view key");
    }
  };

  const handlePagination = (direction: "next" | "prev") => {
    const params = new URLSearchParams(searchParams);
    const currentKeys =
      activeTab === "mcp" ? initialMcpKeys : initialServerKeys;

    if (direction === "next" && currentKeys.nextCursor) {
      params.set("cursor", currentKeys.nextCursor);
    } else if (direction === "prev") {
      params.delete("cursor");
    }

    router.push(`/dashboard/keys?${params.toString()}`);
  };

  const renderKeyList = (
    keys: Key[],
    keyType: "mcp" | "server",
    pagination: PaginatedKeys,
  ) => {
    if (keys.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <KeyIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p
              className="text-muted-foreground text-center"
              data-testid={`no-${keyType}-keys-message`}
            >
              No {keyType === "mcp" ? "MCP" : "server"} keys created yet.
            </p>
            <Button
              onClick={() => handleCreateKey(keyType)}
              className="mt-4"
              data-testid="create-first-key-button"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Your First Key
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <KeyIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p
                      className="font-medium"
                      data-testid={`key-name-${key.id}`}
                    >
                      {key.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {keyType === "mcp" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewKey(key.id, key.name)}
                      data-testid={`view-key-${key.id}`}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteKey(key.id)}
                    className="text-destructive hover:text-destructive"
                    data-testid={`delete-key-${key.id}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {(searchParams.get("cursor") || pagination.hasMore) && (
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handlePagination("prev")}
              disabled={!searchParams.get("cursor")}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <span
              className="text-sm text-muted-foreground"
              data-testid="keys-count"
            >
              {keys.length} key{keys.length !== 1 ? "s" : ""} shown
            </span>

            <Button
              variant="outline"
              onClick={() => handlePagination("next")}
              disabled={!pagination.hasMore}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your MCP and server authentication keys
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="mcp" data-testid="tab-mcp">
              MCP Keys
            </TabsTrigger>
            <TabsTrigger value="server" data-testid="tab-server">
              Server Keys
            </TabsTrigger>
          </TabsList>
          <Button
            onClick={() => handleCreateKey(activeTab)}
            data-testid="create-key-button"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Key
          </Button>
        </div>

        <TabsContent value="mcp" className="space-y-4">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>MCP Keys</CardTitle>
              <CardDescription>
                Keys for authenticating with MCP (Model Context Protocol)
                services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderKeyList(initialMcpKeys.data, "mcp", initialMcpKeys)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="server" className="space-y-4">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Server Keys</CardTitle>
              <CardDescription>
                Keys for server-to-server authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderKeyList(
                initialServerKeys.data,
                "server",
                initialServerKeys,
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateKeyForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        keyType={createKeyType}
      />

      <ViewKeyDialog
        open={viewKeyDialogOpen}
        onOpenChange={setViewKeyDialogOpen}
        keyData={viewingKey}
      />
    </div>
  );
}
