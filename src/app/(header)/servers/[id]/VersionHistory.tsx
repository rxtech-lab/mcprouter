"use client";

import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

interface VersionHistoryProps {
  serverId: string;
  changelogs: Array<{
    id: string;
    version: string;
    changelog: string;
    mcpServerId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

/**
 * Client component for version history and changelog display
 */
export function VersionHistory({ serverId, changelogs }: VersionHistoryProps) {
  // Get unique versions from changelogs, sorted by date
  const versions = changelogs
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((changelog) => changelog.version);

  if (versions.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <Link
        href={`/servers/${serverId}/version-history`}
        className="text-lg font-semibold mb-4 hover:underline"
      >
        Version History
      </Link>
      <div className="space-y-2">
        {versions.map((version) => {
          const changelog = changelogs.find((c) => c.version === version);
          return (
            <Dialog key={version}>
              <DialogTrigger asChild>
                <button
                  data-testid={`server-detail-version-${version}`}
                  className="w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-accent"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      v{version.replace(/^v/, "")}
                    </span>
                    <span className="text-sm opacity-75">
                      {new Date(
                        changelog?.createdAt || "",
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>v{version.replace(/^v/, "")}</DialogTitle>
                </DialogHeader>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{changelog?.changelog || ""}</ReactMarkdown>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}
