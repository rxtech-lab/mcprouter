"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Github,
  ExternalLink,
  Lock,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface McpServerData {
  id: string;
  name: string;
  url: string | null;
  version: string | null;
  description: string | null;
  github: string | null;
  category: string | null;
  tags: string[] | null;
  authenticationMethods: string[];
  image: {
    cover?: string;
    logo?: string;
    icon?: string;
  } | null;
  locationType: string[] | null;
}

interface McpServerCardProps {
  server: McpServerData;
  onShowUrl?: (serverId: string) => void;
}

export function McpServerCard({ server, onShowUrl }: McpServerCardProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const isRemote = server.locationType?.includes("remote");
  const isLocal = server.locationType?.includes("local");

  const handleCardClick = () => {
    router.push(`/servers/${server.id}`);
  };

  const handleGithubClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (server.github) {
      window.open(server.github, "_blank");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer break-inside-avoid mb-4 h-full"
    >
      <Link href={`/servers/${server.id}`}>
        <div
          className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-border/80 h-full"
          data-testid="mcp-server-card"
        >
          {/* Cover Image */}
          {server.image?.cover && !imageError && (
            <div className="relative h-32 overflow-hidden">
              <img
                src={server.image.cover}
                alt={`${server.name} cover`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          <div className="p-4">
            {/* Header with Logo and Title */}
            <div className="flex items-start gap-3 mb-3">
              {server.image?.logo && !imageError ? (
                <img
                  src={server.image.logo}
                  alt={`${server.name} logo`}
                  className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {server.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {server.name}
                </h3>
                {server.version && (
                  <span className="text-xs text-muted-foreground">
                    v{server.version?.replace(/^v/, "")}
                  </span>
                )}
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {server.github && (
                  <button
                    onClick={handleGithubClick}
                    className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                    title="View on GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            {server.description && (
              <div className="text-sm text-muted-foreground mb-3 line-clamp-2 max-w-none">
                <ReactMarkdown
                  components={{
                    img: () => null, // Disable image rendering
                    p: ({ children }) => <span>{children}</span>,
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="text-blue-600 hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {server.description}
                </ReactMarkdown>
              </div>
            )}

            {/* Tags */}
            {server.tags && server.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {server.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                  >
                    {tag}
                  </span>
                ))}
                {server.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs text-muted-foreground">
                    +{server.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Category Badge */}
            {server.category && (
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md">
                  {server.category}
                </span>
              </div>
            )}

            {/* Location Type Indicators */}
            <div className="flex items-center gap-2 mb-3">
              {isRemote && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-md">
                  <ExternalLink className="h-3 w-3" />
                  Remote
                </span>
              )}
              {isLocal && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 rounded-md">
                  <Download className="h-3 w-3" />
                  Local
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
