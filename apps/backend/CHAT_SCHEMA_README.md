# Chat Widget Database Schema

This document describes the database schema for the chat widget system, designed to support multi-tenant chat functionality similar to Intercom or tawk.to.

## Schema Overview

The chat schema leverages your existing Better Auth tables and adds 4 new chat-specific tables:

### Extended Auth Tables (via Better Auth additionalFields)

1. **`organizations`** - Extended with chat widget settings and configuration
2. **`members`** - Extended with chat agent-specific fields

### New Chat Tables

3. **`chat_users`** - Website visitors who use the chat (anonymous or registered)
4. **`conversations`** - Chat sessions between users and agents
5. **`messages`** - Individual messages within conversations
6. **`attachments`** - Files shared in messages
7. **`conversation_assignments`** - Agent assignment tracking

## Database Relationships

```
organizations (auth + chat fields)
    ├── members (auth + chat agent fields)
    ├── chat_users → conversations → messages → attachments
    └── conversation_assignments
```

## Key Features

### Multi-Tenancy

- Organizations use existing `organizations` table with added chat fields
- All chat data is scoped to organizations for complete data isolation
- API keys stored in organization's `chatApiKey` field for secure widget embedding

### User Management

- **Anonymous users**: Tracked by `session_id` without requiring registration
- **Registered users**: Linked to your existing `users` table via `user_id`
- **Flexible metadata**: JSON field for custom user attributes

### Agent Management

- Agents use existing `members` table with added chat fields
- Support for online/offline status via `chatIsOnline` field
- Configurable concurrent chat limits via `chatMaxConcurrentChats`
- Role-based permissions using existing auth roles + `chatRole` field

### Conversation Flow

- Conversations can be assigned to specific agents
- Status tracking (open, closed, waiting, resolved)
- Priority levels (low, normal, high, urgent)
- Rich metadata and tagging support

### Performance Optimizations

- Comprehensive indexing strategy for fast queries
- Optimized for real-time message retrieval
- Efficient conversation listing and filtering

## Usage Examples

### Setting up chat for an organization

```typescript
import { auth } from "../lib/auth";

// Enable chat for an existing organization using Better Auth
const { data, error } = await auth.api.updateOrganization({
  body: {
    organizationId: "existing-org-id",
    chatDomain: "acme.com",
    chatApiKey: generateApiKey(),
    // chatIsActive: true,
    // Widget settings
    chatTheme: "light",
    chatPrimaryColor: "#007bff",
    chatPosition: "bottom-right",
    chatWelcomeMessage: "Hi! How can we help you today?",
    chatShowAgentAvatar: true,
    chatCollectEmail: true,
    chatCollectName: true,
  },
});
```

### Creating a chat user (anonymous visitor)

```typescript
import { chatUsers } from "../db/schema/chat";

const visitor = await db.insert(chatUsers).values({
  id: generateId(),
  organizationId: "org-id", // existing organization ID
  userId: null, // anonymous
  sessionId: generateSessionId(),
  name: "Anonymous",
  userAgent: req.headers["user-agent"],
  ipAddress: getClientIP(req),
  metadata: JSON.stringify({
    source: "website",
    page: "/pricing",
  }),
  createdAt: new Date(),
  lastSeenAt: new Date(),
});
```

### Starting a conversation

```typescript
import { conversations } from "../db/schema/chat";

const conversation = await db.insert(conversations).values({
  id: generateId(),
  organizationId: "org-id", // existing organization ID
  chatUserId: visitor.id,
  status: "open",
  priority: "normal",
  pageUrl: "https://acme.com/pricing",
  referrer: "https://google.com",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### Sending a message

```typescript
import { messages } from "../db/schema/chat";

const message = await db.insert(messages).values({
  id: generateId(),
  conversationId: conversation.id,
  senderId: visitor.id,
  senderType: "user",
  content: "Hello, I have a question about pricing",
  messageType: "text",
  isRead: false,
  createdAt: new Date(),
});
```

### Assigning an agent

```typescript
import { eq } from "drizzle-orm";

import { conversationAssignments, conversations } from "../db/schema/chat";

// Update conversation (assignedAgentId now references members.id)
await db
  .update(conversations)
  .set({
    assignedAgentId: "member-id", // references members table
    updatedAt: new Date(),
  })
  .where(eq(conversations.id, conversationId));

// Track assignment
await db.insert(conversationAssignments).values({
  id: generateId(),
  conversationId: conversationId,
  agentId: "member-id", // references members table
  assignedBy: "supervisor-member-id",
  reason: "auto",
  assignedAt: new Date(),
});
```

### Querying conversations for an agent

```typescript
import { and, desc, eq } from "drizzle-orm";

import { chatUsers, conversations, messages } from "../db/schema/chat";

const agentConversations = await db
  .select({
    id: conversations.id,
    status: conversations.status,
    priority: conversations.priority,
    subject: conversations.subject,
    createdAt: conversations.createdAt,
    chatUser: {
      name: chatUsers.name,
      email: chatUsers.email,
    },
    lastMessage: {
      content: messages.content,
      createdAt: messages.createdAt,
    },
  })
  .from(conversations)
  .leftJoin(chatUsers, eq(conversations.chatUserId, chatUsers.id))
  .leftJoin(messages, eq(conversations.id, messages.conversationId))
  .where(
    and(
      eq(conversations.assignedAgentId, memberId), // now references members.id
      eq(conversations.status, "open"),
    ),
  )
  .orderBy(desc(conversations.updatedAt));
```

## Migration

To apply the schema:

1. **Generate migration** (already done):

   ```bash
   cd apps/backend
   npm run db:generate
   ```

2. **Apply migration**:

   ```bash
   npm run db:migrate
   ```

3. **Verify tables**:

   ```sql
   \dt chat_*
   ```

## Best Practices

### Security

- Always validate API keys before processing chat requests
- Sanitize message content to prevent XSS
- Rate limit message sending to prevent spam
- Implement CORS properly for widget embedding

### Performance

- Use the provided indexes for efficient queries
- Consider pagination for message history
- Implement message archiving for old conversations
- Cache frequently accessed widget settings

### Data Management

- Regularly clean up old anonymous chat users
- Archive closed conversations after a retention period
- Backup conversation data before implementing retention policies
- Monitor database size and plan for scaling

### Real-time Features

- Use WebSockets or SSE for real-time message delivery
- Implement typing indicators with temporary storage
- Consider using Redis for presence management
- Queue message processing for reliability

## Next Steps

1. **API Routes**: Create REST/GraphQL endpoints for the chat functionality
2. **Real-time Layer**: Implement WebSocket handling for live chat
3. **Widget SDK**: Build the JavaScript widget that embeds on customer sites
4. **Admin Dashboard**: Create interfaces for managing agents and settings
5. **Analytics**: Add conversation and performance tracking
6. **Webhooks**: Implement webhook delivery for external integrations

## Schema Considerations

The schema is designed to be:

- **Scalable**: Indexed for performance at scale
- **Flexible**: JSON metadata fields for extensibility
- **Secure**: Proper foreign key constraints and cascading deletes
- **Maintainable**: Clear naming conventions and relationships
- **Compatible**: Integrates seamlessly with existing auth system

For questions or modifications, refer to the Drizzle ORM documentation at <https://orm.drizzle.team/>
