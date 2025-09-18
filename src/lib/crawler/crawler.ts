/**
 * Use https://upstash.com/docs/workflow/quickstarts/vercel-nextjs#bun to create a task for every github mcp server.
 * If new mcp server is added, enqueue the job.
 * If mcp server is deleted, delete the existing job.
 * We only enqueue the job if mcp server is public and has a github url. Also only store the server id in the task and
 * we will fetch the server data from the database.
 *
 * Job is enqueued every 24 hours and max concurrency is 10.
 */
import { Octokit } from "@octokit/rest";
import { db, mcpServers, type McpServer } from "../db";
import { Client } from "@upstash/qstash";
import { eq } from "drizzle-orm";

export type Changelog = {
  version: string;
  date: string;
  description: string;
};

export type GitHubInfo = {
  currentVersion: string;
  readme: string;
  /**
   * Store only the changelogs not in the db. Some info
   */
  changelogs: Changelog[];
};

const maxConcurrency = 10;

// every 24 hours
const cronExpression = "0 0 * * *";

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:3000`; // for local development

/**
 * Enqueue new mcp server to crawl the data from github or update the existing one
 */
export async function enqueueCrawlerJob(server: McpServer) {
  if (process.env.IS_PLAYWRIGHT_TEST === "true") {
    return;
  }
  const client = new Client({
    token: process.env.QSTASH_TOKEN!,
    baseUrl: process.env.QSTASH_URL!,
  });
  if (!server.isPublic || !server.github) {
    return;
  }

  const workflowUrl = `${BASE_URL}/api/crawler/workflow?x-vercel-protection-bypass=${process.env.VERCEL_PROTECTION_BYPASS}`;
  const scheduleId = `crawler-${server.id}`;
  // delete the existing job if it exists
  await client.schedules.delete(scheduleId);
  await client.schedules.create({
    destination: workflowUrl,
    retries: 3,
    body: JSON.stringify({ serverId: server.id }),
    cron: cronExpression,
    scheduleId,
    delay: 3600, // 1 hour
  });
}

export async function deleteCrawlerJob(server: McpServer) {
  if (process.env.IS_PLAYWRIGHT_TEST === "true") {
    return;
  }
  const client = new Client({
    token: process.env.QSTASH_TOKEN!,
    baseUrl: process.env.QSTASH_URL!,
  });
  await client.schedules.delete(`crawler-${server.id}`);
}

export async function crawlGitHubInfo(serverId: string): Promise<GitHubInfo> {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const server = await db.query.mcpServers.findFirst({
    where: eq(mcpServers.id, serverId),
  });

  if (!server?.github) {
    throw new Error("Server does not have a GitHub URL");
  }

  const githubUrl = server.github;
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL format");
  }

  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, "");

  try {
    let currentVersion = "";
    let readme = "";
    const changelogs: Changelog[] = [];

    // Fetch releases and README in parallel
    const [releasesData, readmeData] = await Promise.allSettled([
      octokit.rest.repos.listReleases({
        owner,
        repo: cleanRepo,
        per_page: 100,
      }),
      octokit.rest.repos.getReadme({ owner, repo: cleanRepo }),
    ]);

    // Extract README content
    if (readmeData.status === "fulfilled") {
      readme = Buffer.from(readmeData.value.data.content, "base64").toString(
        "utf-8"
      );
    }

    // Process releases or fallback to tags
    if (
      releasesData.status === "fulfilled" &&
      releasesData.value.data.length > 0
    ) {
      const releases = releasesData.value.data;
      currentVersion = releases[0].tag_name || "";

      // Convert releases to changelogs
      for (const release of releases) {
        if (release.tag_name) {
          changelogs.push({
            version: release.tag_name,
            date: release.published_at || release.created_at,
            description: release.body || "",
          });
        }
      }
    } else {
      // Fallback to tags if no releases
      try {
        const tagsData = await octokit.rest.repos.listTags({
          owner,
          repo: cleanRepo,
          per_page: 100,
        });

        if (tagsData.data.length > 0) {
          currentVersion = tagsData.data[0].name;

          // Convert tags to basic changelogs
          for (const tag of tagsData.data) {
            changelogs.push({
              version: tag.name,
              date: new Date().toISOString(),
              description: `Tag ${tag.name}`,
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch tags for ${owner}/${cleanRepo}:`, error);
      }
    }

    return {
      currentVersion,
      readme,
      changelogs,
    };
  } catch (error) {
    console.error(
      `Failed to crawl GitHub info for ${owner}/${cleanRepo}:`,
      error
    );
    throw error;
  }
}
