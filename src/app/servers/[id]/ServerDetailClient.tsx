"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Github,
  Globe,
  Download,
  ExternalLink,
  Lock,
  Calendar,
  Tag,
  Share2,
  Info,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Instagram,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/Header";
import {
  downloadMcpServerFile,
  generateServerUrlWithApiKey,
} from "@/app/actions/mcp-actions";
import { cn } from "@/lib/utils";

interface ServerDetailProps {
  server: {
    id: string;
    name: string;
    url: string | null;
    version: string | null;
    description: string | null;
    github: string | null;
    socialLinks: {
      website?: string;
      twitter?: string;
      discord?: string;
      telegram?: string;
      instagram?: string;
      youtube?: string;
      linkedin?: string;
      facebook?: string;
      pinterest?: string;
      reddit?: string;
      tiktok?: string;
      twitch?: string;
      vimeo?: string;
    } | null;
    downloadLinks: Array<{ platform: string; link: string }> | null;
    locationType: string[] | null;
    category: string | null;
    tags: string[] | null;
    image: {
      cover?: string;
      logo?: string;
      icon?: string;
    } | null;
    authenticationMethods: string[];
    isPublic: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    changelogs: Array<{
      id: string;
      version: string;
      changelog: string;
      mcpServerId: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  };
}

export function ServerDetailClient({ server }: ServerDetailProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const requiresApiKey = server.authenticationMethods.includes("apiKey");
  const isRemote = server.locationType?.includes("remote");
  const isLocal = server.locationType?.includes("local");
  const isAuthenticated = status === "authenticated" && !!session?.user;

  // Get unique versions from changelogs, sorted by date
  const versions = server.changelogs
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((changelog) => changelog.version);

  const selectedChangelog = selectedVersion
    ? server.changelogs.find((c) => c.version === selectedVersion)
    : null;

  const handleDownload = async (platform: string, link: string) => {
    setIsDownloading(platform);
    try {
      // For direct links, just open them
      window.open(link, "_blank");
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleShowRemoteUrl = async () => {
    if (requiresApiKey && !isAuthenticated) {
      router.push("/auth/signin");
    } else {
      // Show the URL directly if no API key required or user is authenticated
      const displayUrl =
        server.url?.replace(/\{\{version\}\}/g, server.version || "latest") ||
        "";
      navigator.clipboard.writeText(displayUrl);
      // You could add a toast notification here
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "website":
        return <Globe className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          data-testid="server-detail-back-btn"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to servers
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-lg p-6"
            >
              <div className="flex items-start gap-4">
                {server.image?.logo && !imageError ? (
                  <img
                    src={server.image.logo}
                    alt={`${server.name} logo`}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-sm">
                    {server.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1
                      data-testid="server-detail-title"
                      className="text-2xl font-bold text-foreground"
                    >
                      {server.name}
                    </h1>
                    {server.version && (
                      <span className="inline-flex items-center px-2 py-1 text-sm bg-primary/10 text-primary rounded-md font-medium">
                        v{server.version}
                      </span>
                    )}
                  </div>
                  {server.description && (
                    <p
                      data-testid="server-detail-description"
                      className="text-muted-foreground leading-relaxed"
                    >
                      {server.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Cover Image */}
            {server.image?.cover && !imageError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative h-64 rounded-lg overflow-hidden"
              >
                <img
                  src={server.image.cover}
                  alt={`${server.name} cover`}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              </motion.div>
            )}

            {/* Tags and Category */}
            {(server.category || (server.tags && server.tags.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Tags & Category</h3>
                <div className="space-y-3">
                  {server.category && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                        Category
                      </label>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
                        <Tag className="h-3 w-3" />
                        {server.category}
                      </span>
                    </div>
                  )}
                  {server.tags && server.tags.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {server.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Remote URL Section */}
            {server.url && isRemote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Remote Access</h3>
                  <button
                    onClick={handleShowRemoteUrl}
                    data-testid="server-detail-remote-url-btn"
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      requiresApiKey && !isAuthenticated
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    {requiresApiKey && !isAuthenticated ? (
                      <>
                        <Lock className="h-3 w-3" />
                        Sign in to access
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3 w-3" />
                        Copy URL
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Server URL
                    </label>
                    {requiresApiKey && !isAuthenticated ? (
                      <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <Lock className="h-4 w-4" />
                          <p className="text-sm font-medium">
                            Requires API key authentication
                          </p>
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Sign in to access the server URL with your API key
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 p-3 bg-muted/50 border rounded-md">
                        <code className="text-xs text-muted-foreground break-all font-mono">
                          {server.url?.replace(
                            /\{\{version\}\}/g,
                            server.version || "latest",
                          )}
                        </code>
                      </div>
                    )}
                  </div>

                  {!(requiresApiKey && !isAuthenticated) && (
                    <div className="text-xs text-muted-foreground">
                      💡 Click "Copy URL" to copy the server URL to your
                      clipboard
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Download Links */}
            {server.downloadLinks && server.downloadLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card border rounded-lg p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Download className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Downloads</h3>
                </div>
                <div className="space-y-2">
                  {server.downloadLinks.map((download) => (
                    <button
                      key={download.platform}
                      onClick={() =>
                        handleDownload(download.platform, download.link)
                      }
                      disabled={isDownloading === download.platform}
                      data-testid={`server-detail-download-${download.platform.toLowerCase()}`}
                      className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Download className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{download.platform}</span>
                      </div>
                      {isDownloading === download.platform ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Version History */}
            {versions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card border rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Version History</h3>
                <div className="space-y-2 mb-4">
                  {versions.map((version) => (
                    <button
                      key={version}
                      onClick={() =>
                        setSelectedVersion(
                          selectedVersion === version ? null : version,
                        )
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
                            server.changelogs.find((c) => c.version === version)
                              ?.createdAt || "",
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedChangelog && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-t pt-4"
                  >
                    <h4 className="font-medium mb-2">
                      Changelog for v{selectedChangelog.version}
                    </h4>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {selectedChangelog.changelog}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Server Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border rounded-lg p-6"
            >
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
                                  : "bg-secondary text-secondary-foreground",
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
              </div>
            </motion.div>

            {/* Links */}
            {(server.github ||
              (server.socialLinks &&
                Object.values(server.socialLinks).some(Boolean))) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border rounded-lg p-6"
              >
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
                        ),
                    )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
