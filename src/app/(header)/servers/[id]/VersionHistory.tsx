"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface VersionHistoryProps {
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
export function VersionHistory({ changelogs }: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  // Get unique versions from changelogs, sorted by date
  const versions = changelogs
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((changelog) => changelog.version);

  const selectedChangelog = selectedVersion
    ? changelogs.find((c) => c.version === selectedVersion)
    : null;

  if (versions.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Version History</h3>
      <div className="space-y-2 mb-4">
        {versions.map((version) => (
          <button
            key={version}
            onClick={() =>
              setSelectedVersion(selectedVersion === version ? null : version)
            }
            data-testid={`server-detail-version-${version}`}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md transition-colors",
              selectedVersion === version
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">v{version}</span>
              <span className="text-sm opacity-75">
                {new Date(
                  changelogs.find((c) => c.version === version)?.createdAt ||
                    "",
                ).toLocaleDateString()}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedChangelog && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">
            Changelog for v{selectedChangelog.version}
          </h4>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
              {selectedChangelog.changelog}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
