ALTER TABLE "chat_agents" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_organizations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "widget_settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "chat_agents" CASCADE;--> statement-breakpoint
DROP TABLE "chat_organizations" CASCADE;--> statement-breakpoint
DROP TABLE "widget_settings" CASCADE;--> statement-breakpoint
ALTER TABLE "chat_users" DROP CONSTRAINT "chat_users_organization_id_chat_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "conversation_assignments" DROP CONSTRAINT "conversation_assignments_agent_id_chat_agents_id_fk";
--> statement-breakpoint
ALTER TABLE "conversation_assignments" DROP CONSTRAINT "conversation_assignments_assigned_by_chat_agents_id_fk";
--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_organization_id_chat_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_assigned_agent_id_chat_agents_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_users" ADD CONSTRAINT "chat_users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_assignments" ADD CONSTRAINT "conversation_assignments_agent_id_members_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_assignments" ADD CONSTRAINT "conversation_assignments_assigned_by_members_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_agent_id_members_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;