import { getPublicMcpServerDetail } from "@/app/actions/mcp-actions";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { getApiKey } from "@/lib/db/queries/key_queries";
import { generateUrlWithApiKey } from "@/lib/server-utils";
import { cn } from "@/lib/utils";
import {
  Book,
  Calendar,
  Download,
  ExternalLink,
  Github,
  Globe,
  Info,
  Lock,
  Tag,
} from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { UsePopoverClient } from "./UsePopoverClient";
import { VersionHistory } from "./VersionHistory";

interface ServerPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Get social media icon component for a given platform
 */
function getSocialIcon(platform: string) {
  switch (platform) {
    case "website":
      return <Globe className="h-4 w-4" />;
    default:
      return <ExternalLink className="h-4 w-4" />;
  }
}

/**
 * Server component for rendering MCP server details
 * Uses server-side rendering for better performance and SEO
 */
export default async function ServerPage({ params }: ServerPageProps) {
  const server = await getPublicMcpServerDetail((await params).id);
  const session = await auth();

  if (!server) {
    notFound();
  }

  // Get API key only if user is authenticated
  let apiKey = null;
  if (session?.user?.id) {
    try {
      apiKey = await getApiKey(session.user.id);
    } catch (error) {
      // Handle case where user doesn't have an API key yet
      apiKey = null;
    }
  }

  const requiresApiKey = server.authenticationMethods.includes("apiKey");
  const isAuthenticated = !!session?.user;

  // Generate URL only if we have an API key or if API key is not required
  let url = server.url;
  if (requiresApiKey && apiKey?.value) {
    url = generateUrlWithApiKey(server.url!, apiKey.value, server.version);
  } else if (!requiresApiKey && server.url) {
    url = server.url;
  }

  return (
    <div className="">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="space-y-6 mb-4">
          {/* Header Row - Avatar, Name, Version, and Use Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {server.image?.logo ? (
                <img
                  src={server.image.logo}
                  alt={`${server.name} logo`}
                  className="w-4 h-4 rounded-2xl object-cover border shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                  {server.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1
                    data-testid="server-detail-title"
                    className="text-xl font-bold text-foreground"
                  >
                    {server.name}
                  </h1>
                  {server.version && (
                    <span className="inline-flex items-center px-3 py-1 text-sm bg-primary/10 text-primary rounded-full font-medium">
                      v{server.version?.replace(/^v/, "")}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant="secondary">{server.category}</Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <UsePopoverClient
                server={{
                  name: server.name,
                  version: server.version,
                  url: server.url,
                  downloadLinks: server.downloadLinks || undefined,
                  authenticationMethods: server.authenticationMethods,
                  locationType: server.locationType,
                }}
                url={url}
                requiresApiKey={requiresApiKey}
                isAuthenticated={isAuthenticated}
                apiKey={apiKey}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover Image */}
            {server.image?.cover && (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={server.image.cover}
                  alt={`${server.name} cover`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {server.description && (
              <div className="border rounded-lg">
                <div
                  data-testid="server-detail-description"
                  className="text-lg text-muted-foreground leading-relaxed prose prose-stone dark:prose-invert max-w-none"
                >
                  <div className="flex items-center h-full border-b border-gray-200 mt-4 mb-4 pb-2">
                    <Book className="h-4 w-4 ml-4" />
                    <p className="text-black font-semibold ml-2">Readme</p>
                  </div>
                  <div className="p-4 prose prose-stone dark:prose-invert max-w-none">
                    <ReactMarkdown>{server.description}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Server Info */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Server Information</h3>
              </div>
              <div className="space-y-4">
                {/* Location Types */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Location Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {server.locationType?.includes("remote") && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-md">
                        <ExternalLink className="h-3 w-3" />
                        remote
                      </span>
                    )}
                    {server.locationType?.includes("local") && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 rounded-md">
                        <Download className="h-3 w-3" />
                        local
                      </span>
                    )}
                  </div>
                </div>

                {/* Authentication Methods */}
                {server.authenticationMethods &&
                  server.authenticationMethods.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Authentication
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {server.authenticationMethods.map((method) => (
                          <span
                            key={method}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md",
                              method === "apiKey"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : method === "none"
                                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                  : "bg-secondary text-secondary-foreground"
                            )}
                          >
                            {method === "apiKey" && (
                              <Lock className="h-3 w-3" />
                            )}
                            {method === "apiKey" ? "API Key Required" : method}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Date Added */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Added {new Date(server.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {server.github && (
                  <a
                    href={server.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-1 py-1 text-sm"
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </a>
                )}
              </div>
            </div>

            {server.tags && server.tags.length > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {server.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Version History */}
            <VersionHistory changelogs={server.changelogs} />

            {/* Links */}
            {(server.github ||
              (server.socialLinks &&
                Object.values(server.socialLinks).some(Boolean))) && (
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Links</h3>
                </div>
                <div className="space-y-2">
                  {server.github && (
                    <a
                      href={server.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="server-detail-github-link"
                      className="inline-flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub Repository
                    </a>
                  )}

                  {server.socialLinks &&
                    Object.entries(server.socialLinks).map(
                      ([platform, url]) =>
                        url && (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors capitalize"
                          >
                            {getSocialIcon(platform)}
                            {platform}
                          </a>
                        )
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
