"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CopyIcon,
  CheckIcon,
  Lock,
  Download,
  ExternalLink,
  Play,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UsePopoverProps {
  server: {
    name: string;
    version?: string | null;
    url?: string | null;
    downloadLinks?: Array<{
      platform: string;
      link: string;
    }>;
    authenticationMethods: string[];
    locationType?: string[] | null;
  };
  url?: string | null;
  requiresApiKey: boolean;
  isAuthenticated: boolean;
  apiKey?: { value: string } | null;
}

export function UsePopover({
  server,
  url,
  requiresApiKey,
  isAuthenticated,
  apiKey,
}: UsePopoverProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRemote = server.locationType?.includes("remote");
  const hasDownloads = server.downloadLinks && server.downloadLinks.length > 0;

  // Determine which tab to show by default
  const defaultTab = isRemote ? "remote" : "download";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
        >
          <Play className="h-5 w-5 mr-2" />
          Use server
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="center" side="bottom">
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              Use {server.name}
              {server.version && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  v{server.version.replace(/^v/, "")}
                </span>
              )}
            </h3>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList
              className={`grid w-full ${isRemote && hasDownloads ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {isRemote && (
                <TabsTrigger value="remote" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Remote
                </TabsTrigger>
              )}
              {hasDownloads && (
                <TabsTrigger
                  value="download"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </TabsTrigger>
              )}
            </TabsList>

            {isRemote && (
              <TabsContent value="remote" className="space-y-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Server URL</h4>
                  {requiresApiKey && !isAuthenticated ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-1">
                        <Lock className="h-4 w-4" />
                        <p className="text-sm font-medium">
                          Authentication required
                        </p>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        <Link
                          href="/auth/signin"
                          className="underline hover:no-underline font-medium"
                        >
                          Sign in
                        </Link>{" "}
                        to access the server URL
                      </p>
                    </div>
                  ) : requiresApiKey && isAuthenticated && !apiKey?.value ? (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-1">
                        <Lock className="h-4 w-4" />
                        <p className="text-sm font-medium">Missing API key</p>
                      </div>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        <Link
                          href="/dashboard/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline font-medium"
                        >
                          Create an API key
                        </Link>{" "}
                        to access this server
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-muted/50 border rounded-md">
                        <code className="flex-1 text-xs font-mono break-all text-muted-foreground">
                          {url || server.url}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(url || server.url || "")
                          }
                          className="shrink-0"
                        >
                          {copied ? (
                            <CheckIcon className="h-3 w-3" />
                          ) : (
                            <CopyIcon className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        💡 Click to copy URL
                      </div>
                    </div>
                  )}
                </div>

                {/* Authentication Info */}
                {server.authenticationMethods.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Authentication</h4>
                    <div className="flex flex-wrap gap-1">
                      {server.authenticationMethods.map((method) => (
                        <span
                          key={method}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md",
                            method === "apiKey"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                              : method === "none"
                                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                : "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {method === "apiKey" && <Lock className="h-3 w-3" />}
                          {method === "apiKey" ? "API Key Required" : method}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            )}

            {hasDownloads && (
              <TabsContent value="download" className="space-y-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Available Downloads
                  </h4>
                  <div className="space-y-2">
                    {server.downloadLinks?.map((download) => (
                      <a
                        key={download.platform}
                        href={download.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between p-2 border border-border rounded-md hover:bg-accent transition-colors group text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-muted rounded-sm flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Download className="h-3 w-3" />
                          </div>
                          <span className="font-medium">
                            {download.platform}
                          </span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}
