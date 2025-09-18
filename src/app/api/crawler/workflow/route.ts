import { crawlGitHubInfo } from "@/lib/crawler/crawler";
import { changelogs, db, mcpServers } from "@/lib/db";
import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";

export const { POST } = serve<{ serverId: string }>(async (context) => {
  const { serverId } = context.requestPayload;

  const githubInfo = await context.run("crawl-github-info", async () => {
    const info = await crawlGitHubInfo(serverId);
    return info;
  });

  if (!githubInfo) {
    console.log(`No GitHub info found for server ${serverId}`);
    return;
  }

  await context.run("update-server-version", async () => {
    if (githubInfo.currentVersion) {
      await db
        .update(mcpServers)
        .set({
          version: githubInfo.currentVersion,
          description: githubInfo.readme,
          updatedAt: new Date(),
        })
        .where(eq(mcpServers.id, serverId));

      console.log(
        `Updated server ${serverId} version to ${githubInfo.currentVersion}`,
      );
    }
  });

  await context.run("insert-changelogs", async () => {
    if (githubInfo.changelogs.length > 0) {
      const changelogRecords = githubInfo.changelogs.map((changelog) => ({
        id: `${serverId}-${changelog.version}`,
        mcpServerId: serverId,
        version: changelog.version,
        changelog: changelog.description,
        createdAt: new Date(changelog.date),
        updatedAt: new Date(),
      }));

      await db
        .insert(changelogs)
        .values(changelogRecords)
        .onConflictDoNothing();
      console.log(
        `Inserted ${changelogRecords.length} changelogs for server ${serverId}`,
      );
    }
  });
});
