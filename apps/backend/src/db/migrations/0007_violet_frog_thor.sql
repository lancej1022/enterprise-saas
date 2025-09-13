CREATE TABLE "chat_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"session_token" text NOT NULL,
	"user_identifier" text,
	"domain" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "chat_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_security_level" text DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_allowed_domains" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_jwt_secret" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_session_duration" integer;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;