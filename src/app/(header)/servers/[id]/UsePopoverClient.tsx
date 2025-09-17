"use client";

import { UsePopover } from "./UsePopover";

interface UsePopoverClientProps {
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

export function UsePopoverClient({
  server,
  url,
  requiresApiKey,
  isAuthenticated,
  apiKey,
}: UsePopoverClientProps) {
  return (
    <UsePopover
      server={server}
      url={url}
      requiresApiKey={requiresApiKey}
      isAuthenticated={isAuthenticated}
      apiKey={apiKey}
    />
  );
}
