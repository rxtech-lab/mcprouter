import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  getPaginatedChangelogs,
  getPublicMcpServerDetail,
} from "@/app/actions/mcp-actions";
import { Button } from "@/components/ui/button";

interface VersionHistoryPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    cursor?: string;
    direction?: "next" | "prev";
  }>;
}

/**
 * Server component for rendering paginated version history
 */
export default async function VersionHistoryPage({
  params,
  searchParams,
}: VersionHistoryPageProps) {
  const { id } = await params;
  const { cursor, direction } = await searchParams;

  // Get server details first to ensure it exists
  const server = await getPublicMcpServerDetail(id);

  if (!server) {
    notFound();
  }

  // Get paginated changelogs
  const changelogData = await getPaginatedChangelogs(id, {
    cursor,
    direction,
    limit: 5, // Show 5 versions per page
  });

  const {
    data: changelogs,
    hasMore,
    hasPrev,
    nextCursor,
    prevCursor,
  } = changelogData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/servers/${id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {server.name}
        </Link>

        <div className="flex items-center gap-4">
          {server.image?.logo ? (
            <img
              src={server.image.logo}
              alt={`${server.name} logo`}
              className="w-12 h-12 rounded-lg object-cover border shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
              {server.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Version History
            </h1>
            <p className="text-lg text-muted-foreground">{server.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl">
        {changelogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No version history available for this server.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {changelogs.map((changelog) => (
              <div className="flex flex-row lg:gap-20" key={changelog.id}>
                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center px-3 py-1 text-sm bg-primary/10 text-primary rounded-full font-medium">
                    v{changelog.version.replace(/^v/, "")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(changelog.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="border rounded-lg bg-card shadow-sm flex-1">
                  {/* Version Header */}

                  {/* Changelog Content */}
                  <div className="p-6">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{changelog.changelog}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(hasMore || hasPrev) && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center gap-2">
              {hasPrev ? (
                <Link
                  href={`/servers/${id}/version-history?cursor=${prevCursor}&direction=prev`}
                  className="inline-flex"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {changelogs.length} version
              {changelogs.length !== 1 ? "s" : ""}
            </div>

            <div className="flex items-center gap-2">
              {hasMore ? (
                <Link
                  href={`/servers/${id}/version-history?cursor=${nextCursor}&direction=next`}
                  className="inline-flex"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
