import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import * as authSchema from "./auth";

// Website visitors and registered users who chat
export const chatUsers = pgTable(
  "chat_users",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => authSchema.organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => authSchema.users.id), // null for anonymous
    email: text("email"),
    name: text("name"),
    sessionId: text("session_id"), // for anonymous users
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    metadata: text("metadata"), // JSON for custom fields
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    lastSeenAt: timestamp("last_seen_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("chat_users_org_session_idx").on(
      table.organizationId,
      table.sessionId,
    ),
    index("chat_users_email_idx").on(table.email),
    index("chat_users_user_id_idx").on(table.userId),
  ],
);

// Chat conversations/sessions
export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => authSchema.organizations.id, { onDelete: "cascade" }),
    chatUserId: text("chat_user_id")
      .notNull()
      .references(() => chatUsers.id, { onDelete: "cascade" }),
    assignedAgentId: text("assigned_agent_id").references(
      () => authSchema.members.id,
    ),
    status: text("status")
      .$defaultFn(() => "open")
      .notNull(), // open, closed, waiting, resolved
    priority: text("priority")
      .$defaultFn(() => "normal")
      .notNull(), // low, normal, high, urgent
    subject: text("subject"),
    tags: text("tags"), // JSON array
    pageUrl: text("page_url"), // where conversation started
    referrer: text("referrer"),
    metadata: text("metadata"), // JSON for custom fields
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
    closedAt: timestamp("closed_at"),
  },
  (table) => [
    index("conversations_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("conversations_agent_status_idx").on(
      table.assignedAgentId,
      table.status,
    ),
    index("conversations_user_idx").on(table.chatUserId),
    index("conversations_created_idx").on(table.createdAt),
  ],
);

// Individual messages
export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id").notNull(), // chatUserId or agentId
    senderType: text("sender_type").notNull(), // user, agent, system
    content: text("content").notNull(),
    messageType: text("message_type")
      .$defaultFn(() => "text")
      .notNull(), // text, image, file, system
    metadata: text("metadata"), // JSON for rich content
    isRead: boolean("is_read")
      .$defaultFn(() => false)
      .notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    editedAt: timestamp("edited_at"),
  },
  (table) => [
    index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),
    index("messages_sender_type_idx").on(table.senderId, table.senderType),
    index("messages_conversation_unread_idx").on(
      table.conversationId,
      table.isRead,
    ),
  ],
);

// File attachments
export const attachments = pgTable(
  "attachments",
  {
    id: text("id").primaryKey(),
    messageId: text("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: text("mime_type").notNull(),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("attachments_message_idx").on(table.messageId)],
);

// Conversation assignments and transfers
export const conversationAssignments = pgTable(
  "conversation_assignments",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    agentId: text("agent_id")
      .notNull()
      .references(() => authSchema.members.id, { onDelete: "cascade" }),
    assignedBy: text("assigned_by").references(() => authSchema.members.id),
    assignedAt: timestamp("assigned_at")
      .$defaultFn(() => new Date())
      .notNull(),
    unassignedAt: timestamp("unassigned_at"),
    reason: text("reason"), // auto, manual, transfer
  },
  (table) => [
    index("conv_assignments_conversation_idx").on(table.conversationId),
    index("conv_assignments_agent_idx").on(table.agentId),
    index("conv_assignments_active_idx").on(
      table.conversationId,
      table.unassignedAt,
    ),
  ],
);

// Relations
export const chatUsersRelations = relations(chatUsers, ({ one, many }) => ({
  organization: one(authSchema.organizations, {
    fields: [chatUsers.organizationId],
    references: [authSchema.organizations.id],
  }),
  user: one(authSchema.users, {
    fields: [chatUsers.userId],
    references: [authSchema.users.id],
  }),
  conversations: many(conversations),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    organization: one(authSchema.organizations, {
      fields: [conversations.organizationId],
      references: [authSchema.organizations.id],
    }),
    chatUser: one(chatUsers, {
      fields: [conversations.chatUserId],
      references: [chatUsers.id],
    }),
    assignedAgent: one(authSchema.members, {
      fields: [conversations.assignedAgentId],
      references: [authSchema.members.id],
    }),
    messages: many(messages),
    assignments: many(conversationAssignments),
  }),
);

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, {
    fields: [attachments.messageId],
    references: [messages.id],
  }),
}));

export const conversationAssignmentsRelations = relations(
  conversationAssignments,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationAssignments.conversationId],
      references: [conversations.id],
    }),
    agent: one(authSchema.members, {
      fields: [conversationAssignments.agentId],
      references: [authSchema.members.id],
    }),
    assignedByAgent: one(authSchema.members, {
      fields: [conversationAssignments.assignedBy],
      references: [authSchema.members.id],
    }),
  }),
);
