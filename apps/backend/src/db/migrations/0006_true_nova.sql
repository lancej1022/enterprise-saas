CREATE TABLE "apikeys" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"start" text,
	"prefix" text,
	"key" text NOT NULL,
	"user_id" text NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp,
	"enabled" boolean DEFAULT true,
	"rate_limit_enabled" boolean DEFAULT true,
	"rate_limit_time_window" integer DEFAULT 86400000,
	"rate_limit_max" integer DEFAULT 10,
	"request_count" integer,
	"remaining" integer,
	"last_request" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "chat_display_name" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "chat_role" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_domain" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_api_key" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_webhook_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_theme" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_primary_color" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_position" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_welcome_message" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_collect_email" boolean;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "chat_collect_name" boolean;--> statement-breakpoint
ALTER TABLE "apikeys" ADD CONSTRAINT "apikeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;