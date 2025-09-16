"use client";

import { useState } from "react";
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
  MapPin,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Instagram,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

  const requiresApiKey = server.authenticationMethods.includes("apiKey");
  const isRemote = server.locationType?.includes("remote");
  const isLocal = server.locationType?.includes("local");

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
    if (requiresApiKey) {
      router.push("/auth/signin");
    } else {
      // Show the URL directly if no API key required
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
              className="flex items-start gap-4"
            >
              {server.image?.logo && !imageError ? (
                <img
                  src={server.image.logo}
                  alt={`${server.name} logo`}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {server.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {server.name}
                </h1>
                {server.version && (
                  <span className="inline-block px-2 py-1 text-sm bg-secondary text-secondary-foreground rounded-md mb-2">
                    v{server.version}
                  </span>
                )}
                {server.description && (
                  <p className="text-muted-foreground text-lg">
                    {server.description}
                  </p>
                )}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {server.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  <Tag className="h-3 w-3" />
                  {server.category}
                </span>
              )}
              {server.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* Remote URL Section */}
            {server.url && isRemote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Remote Access</h3>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Server URL
                    </p>
                    {requiresApiKey ? (
                      <p className="text-sm text-muted-foreground">
                        Requires API key authentication
                      </p>
                    ) : (
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {server.url?.replace(
                          /\{\{version\}\}/g,
                          server.version || "latest",
                        )}
                      </code>
                    )}
                  </div>
                  <button
                    onClick={handleShowRemoteUrl}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      requiresApiKey
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    {requiresApiKey ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Sign in to access
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        Copy URL
                      </>
                    )}
                  </button>
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
                <h3 className="text-lg font-semibold mb-4">Download</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {server.downloadLinks.map((download) => (
                    <button
                      key={download.platform}
                      onClick={() =>
                        handleDownload(download.platform, download.link)
                      }
                      disabled={isDownloading === download.platform}
                      className="inline-flex items-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      <span className="font-medium">{download.platform}</span>
                      {isDownloading === download.platform && (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
              <h3 className="text-lg font-semibold mb-4">Server Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {server.locationType?.join(", ") || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Added {new Date(server.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <div className="space-y-2">
                {server.github && (
                  <a
                    href={server.github}
                    target="_blank"
                    rel="noopener noreferrer"
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
          </div>
        </div>
      </main>
    </div>
  );
}
