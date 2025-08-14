CREATE TABLE "attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_agents" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text NOT NULL,
	"is_online" boolean NOT NULL,
	"max_concurrent_chats" integer NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"api_key" text NOT NULL,
	"webhook_url" text,
	"is_active" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "chat_organizations_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "chat_users" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text,
	"email" text,
	"name" text,
	"session_id" text,
	"user_agent" text,
	"ip_address" text,
	"metadata" text,
	"created_at" timestamp NOT NULL,
	"last_seen_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"assigned_by" text,
	"assigned_at" timestamp NOT NULL,
	"unassigned_at" timestamp,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"chat_user_id" text NOT NULL,
	"assigned_agent_id" text,
	"status" text NOT NULL,
	"priority" text NOT NULL,
	"subject" text,
	"tags" text,
	"page_url" text,
	"referrer" text,
	"metadata" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"sender_type" text NOT NULL,
	"content" text NOT NULL,
	"message_type" text NOT NULL,
	"metadata" text,
	"is_read" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"edited_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "widget_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"theme" text NOT NULL,
	"primary_color" text NOT NULL,
	"position" text NOT NULL,
	"welcome_message" text,
	"offline_message" text,
	"show_agent_avatar" boolean NOT NULL,
	"collect_email" boolean NOT NULL,
	"collect_name" boolean NOT NULL,
	"custom_css" text,
	"custom_fields" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_agents" ADD CONSTRAINT "chat_agents_organization_id_chat_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."chat_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_agents" ADD CONSTRAINT "chat_agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_organizations" ADD CONSTRAINT "chat_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_users" ADD CONSTRAINT "chat_users_organization_id_chat_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."chat_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_users" ADD CONSTRAINT "chat_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_assignments" ADD CONSTRAINT "conversation_assignments_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_assignments" ADD CONSTRAINT "conversation_assignments_agent_id_chat_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."chat_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_assignments" ADD CONSTRAINT "conversation_assignments_assigned_by_chat_agents_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."chat_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organization_id_chat_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."chat_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_chat_user_id_chat_users_id_fk" FOREIGN KEY ("chat_user_id") REFERENCES "public"."chat_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_agent_id_chat_agents_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."chat_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_settings" ADD CONSTRAINT "widget_settings_organization_id_chat_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."chat_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachments_message_idx" ON "attachments" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "chat_agents_org_idx" ON "chat_agents" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "chat_agents_user_idx" ON "chat_agents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_agents_online_idx" ON "chat_agents" USING btree ("is_online");--> statement-breakpoint
CREATE INDEX "chat_orgs_org_id_idx" ON "chat_organizations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "chat_orgs_domain_idx" ON "chat_organizations" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "chat_orgs_api_key_idx" ON "chat_organizations" USING btree ("api_key");--> statement-breakpoint
CREATE INDEX "chat_users_org_session_idx" ON "chat_users" USING btree ("organization_id","session_id");--> statement-breakpoint
CREATE INDEX "chat_users_email_idx" ON "chat_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "chat_users_user_id_idx" ON "chat_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "conv_assignments_conversation_idx" ON "conversation_assignments" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "conv_assignments_agent_idx" ON "conversation_assignments" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "conv_assignments_active_idx" ON "conversation_assignments" USING btree ("conversation_id","unassigned_at");--> statement-breakpoint
CREATE INDEX "conversations_org_status_idx" ON "conversations" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "conversations_agent_status_idx" ON "conversations" USING btree ("assigned_agent_id","status");--> statement-breakpoint
CREATE INDEX "conversations_user_idx" ON "conversations" USING btree ("chat_user_id");--> statement-breakpoint
CREATE INDEX "conversations_created_idx" ON "conversations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_conversation_created_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_sender_type_idx" ON "messages" USING btree ("sender_id","sender_type");--> statement-breakpoint
CREATE INDEX "messages_conversation_unread_idx" ON "messages" USING btree ("conversation_id","is_read");--> statement-breakpoint
CREATE INDEX "widget_settings_org_idx" ON "widget_settings" USING btree ("organization_id");--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;