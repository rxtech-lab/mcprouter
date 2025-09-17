"use client";

import { useState } from "react";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
}

/**
 * Client component for the back navigation button
 */
export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      data-testid="server-detail-back-btn"
      className={cn(
        "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors cursor-pointer",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to servers
    </button>
  );
}

interface DownloadButtonProps {
  platform: string;
  link: string;
}

/**
 * Client component for download functionality
 */
export function DownloadButton({ platform, link }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      window.open(link, "_blank");
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      data-testid={`server-detail-download-${platform.toLowerCase()}`}
      className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Download className="h-4 w-4" />
        </div>
        <span className="font-medium">{platform}</span>
      </div>
      {isDownloading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      )}
    </button>
  );
}

interface VersionSelectorProps {
  versions: string[];
  selectedVersion: string | null;
  onVersionSelect: (version: string | null) => void;
  changelogs: Array<{
    version: string;
    createdAt: Date;
  }>;
}

/**
 * Client component for version selection
 */
export function VersionSelector({
  versions,
  selectedVersion,
  onVersionSelect,
  changelogs,
}: VersionSelectorProps) {
  return (
    <div className="space-y-2">
      {versions.map((version) => (
        <button
          key={version}
          onClick={() =>
            onVersionSelect(selectedVersion === version ? null : version)
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
                changelogs.find((c) => c.version === version)?.createdAt || "",
              ).toLocaleDateString()}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
