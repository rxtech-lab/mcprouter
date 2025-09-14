"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  CalendarIcon,
  GlobeIcon,
  HardDriveIcon,
  ShieldIcon,
  KeyIcon,
  Users2Icon,
  LockIcon,
  Bitcoin,
  DollarSign,
  Globe,
  Network,
  Shield,
  Database,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  deleteMcpServerAction,
  toggleMcpServerPublicStatusAction,
} from "@/app/(protected)/dashboard/actions";

interface McpServerCardProps {
  server: {
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
  };
  onEdit: (server: any) => void;
}

const categoryIcons: Record<string, any> = {
  crypto: Bitcoin,
  finance: DollarSign,
  language: Globe,
  networking: Network,
  security: Shield,
  storage: Database,
};

const categoryColors: Record<string, string> = {
  crypto:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  finance:
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  language: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  networking:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  security: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  storage: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
};

export function McpServerCard({ server, onEdit }: McpServerCardProps) {
  const [isDeleting, startDeletingTransition] = useTransition();
  const [isTogglingPublic, startToggleTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        "Are you sure you want to delete this MCP server? This action cannot be undone.",
      )
    ) {
      return;
    }

    startDeletingTransition(async () => {
      const formData = new FormData();
      formData.append("id", server.id);

      const result = await deleteMcpServerAction(formData);
      if (!result.success) {
        alert(result.error || "Failed to delete server");
      }
    });
  };

  const handleTogglePublic = () => {
    startToggleTransition(async () => {
      const formData = new FormData();
      formData.append("id", server.id);
      formData.append("isPublic", server.isPublic.toString());

      const result = await toggleMcpServerPublicStatusAction(formData);
      if (!result.success) {
        alert(result.error || "Failed to update server status");
      }
    });
  };

  const CategoryIcon = server.category
    ? categoryIcons[server.category]
    : GlobeIcon;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <CategoryIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="line-clamp-1 text-lg">
                {server.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {server.description || "No description available"}
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(server)}>
                <EditIcon className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleTogglePublic}
                disabled={isTogglingPublic}
              >
                {server.isPublic ? (
                  <>
                    <EyeOffIcon className="h-4 w-4 mr-2" />
                    Make Private
                  </>
                ) : (
                  <>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Make Public
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Category and Version */}
        <div className="flex items-center gap-2 flex-wrap">
          {server.category && (
            <Badge
              variant="secondary"
              className={`text-xs ${categoryColors[server.category] || ""}`}
            >
              {server.category}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <GitBranchIcon className="h-3 w-3 mr-1" />v{server.version}
          </Badge>
          <Badge
            variant={server.isPublic ? "default" : "secondary"}
            className="text-xs"
          >
            {server.isPublic ? (
              <>
                <Users2Icon className="h-3 w-3 mr-1" />
                Public
              </>
            ) : (
              <>
                <LockIcon className="h-3 w-3 mr-1" />
                Private
              </>
            )}
          </Badge>
        </div>

        {/* Location and Auth */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {server.locationType && server.locationType.length > 0 && (
            <div className="flex items-center gap-1">
              {server.locationType.includes("remote") && (
                <div className="flex items-center gap-1">
                  <GlobeIcon className="h-3 w-3" />
                  <span className="text-xs">Remote</span>
                </div>
              )}
              {server.locationType.includes("local") && (
                <div className="flex items-center gap-1">
                  <HardDriveIcon className="h-3 w-3" />
                  <span className="text-xs">Local</span>
                </div>
              )}
            </div>
          )}

          {server.authenticationMethods &&
            server.authenticationMethods.length > 0 && (
              <div className="flex items-center gap-1">
                {server.authenticationMethods.includes("none") && (
                  <ShieldIcon className="h-3 w-3 opacity-50" />
                )}
                {(server.authenticationMethods.includes("apiKey") ||
                  server.authenticationMethods.includes("oauth")) && (
                  <KeyIcon className="h-3 w-3" />
                )}
                <span className="text-xs">
                  {server.authenticationMethods.includes("none")
                    ? "No Auth"
                    : "Auth Required"}
                </span>
              </div>
            )}
        </div>

        {/* Tags */}
        {server.tags && server.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {server.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
            {server.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                +{server.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t bg-muted/25">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>
              Created {new Date(server.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {server.github && (
              <Link
                href={server.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <ExternalLinkIcon className="h-3 w-3" />
              </Link>
            )}
            {server.url && (
              <Link
                href={server.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <GlobeIcon className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
