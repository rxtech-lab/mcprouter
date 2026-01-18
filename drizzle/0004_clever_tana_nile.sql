DROP TABLE "Account" CASCADE;--> statement-breakpoint
DROP TABLE "Authenticator" CASCADE;--> statement-breakpoint
DROP TABLE "Session" CASCADE;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN "emailVerified";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN "lastVerificationEmailSent";