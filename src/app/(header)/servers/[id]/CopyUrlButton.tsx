"use client";

import { useState } from "react";
import { Share2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CopyUrlButtonProps {
  serverUrl: string;
  serverVersion: string | null;
  requiresApiKey: boolean;
  isAuthenticated: boolean;
}

/**
 * Client component for handling URL copying functionality
 * Separated from server component to enable client-side interactions
 */
export function CopyUrlButton({
  serverUrl,
  serverVersion,
  requiresApiKey,
  isAuthenticated,
}: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    if (requiresApiKey && !isAuthenticated) {
      return; // This case should be handled by the Link wrapper
    }

    const displayUrl = serverUrl.replace(
      /\{\{version\}\}/g,
      serverVersion || "latest",
    );

    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  if (requiresApiKey && !isAuthenticated) {
    return (
      <Link
        href="/auth/signin"
        data-testid="server-detail-remote-url-btn"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
      >
        <Lock className="h-3 w-3" />
        Sign in to access
      </Link>
    );
  }

  return (
    <button
      onClick={handleCopyUrl}
      data-testid="server-detail-remote-url-btn"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
    >
      <Share2 className="h-3 w-3" />
      {copied ? "Copied!" : "Copy URL"}
    </button>
  );
}
