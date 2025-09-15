ALTER TABLE "McpServer" ALTER COLUMN "version" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "McpServer" ADD COLUMN "authenticationMethods" text[] DEFAULT '{"none"}' NOT NULL;--> statement-breakpoint
ALTER TABLE "McpServer" DROP COLUMN "authenticationMethod";