CREATE TABLE "Changelog" (
	"id" text PRIMARY KEY NOT NULL,
	"version" text NOT NULL,
	"changelog" text NOT NULL,
	"mcpServerId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Key" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"type" text NOT NULL,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "McpServer" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"version" text NOT NULL,
	"description" text,
	"github" text,
	"socialLinks" jsonb,
	"downloadLinks" jsonb,
	"locationType" text[],
	"category" text,
	"tags" text[],
	"image" jsonb,
	"authenticationMethod" text[] DEFAULT '{"none"}' NOT NULL,
	"isPublic" boolean DEFAULT true NOT NULL,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Changelog" ADD CONSTRAINT "Changelog_mcpServerId_McpServer_id_fk" FOREIGN KEY ("mcpServerId") REFERENCES "public"."McpServer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Key" ADD CONSTRAINT "Key_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "McpServer" ADD CONSTRAINT "McpServer_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;