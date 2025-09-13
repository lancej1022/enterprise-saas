# AGENTS.md - Hono Server

Node.js Hono backend with Better Auth, Drizzle ORM, Zero Sync, PostgreSQL, and oRPC API endpoints.

## Setup Commands

- Start development: `pnpm dev` (includes database setup)
- Generate migrations: `pnpm db:generate`
- Push schema: `pnpm db:push`
- Seed database: `pnpm seed`
- Type check: `pnpm typecheck`

### API Structure

```
src/
├── routers/
│   ├── index.ts          # Main router aggregation
│   └── chat.ts           # Chat-specific endpoints
├── lib/
│   ├── auth.ts           # Better Auth configuration
│   ├── orpc.ts           # oRPC setup and procedures
│   └── security-audit.ts # Security event logging
├── db/
│   ├── schema/           # Database schema definitions
│   ├── migrations/       # SQL migration files
│   └── seed.ts           # Database seeding
└── zero/
    ├── schema.ts         # Zero configuration
    └── mutators.ts       # Zero custom mutators
```

## Database Development

### Schema Management

Use Drizzle ORM for defining SQL Schemas, but use Zero's ZQL syntax for querying and mutating data

```typescript
// Define schemas in db/schema/
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  organizationId: text("organization_id").references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  messages: many(messages),
}));
```

### Multi-tenant Data Isolation

Always include organization-based filtering:

```typescript
// ✅ Correct - Always filter by organization
const users = await db.query.users.findMany({
  where: eq(users.organizationId, currentOrgId),
});

// ❌ Incorrect - Missing organization filter
const users = await db.query.users.findMany();
```

## API Development

### oRPC Procedures

Define type-safe API endpoints:

```typescript
// Base procedures with middleware
export const protectedProcedure = publicProcedure.use(({ next, context }) => {
  if (!context.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ context: { session: context.session } });
});

// Route definition
export const userRouter = {
  getProfile: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .output(z.object({ id: z.string(), name: z.string() }))
    .handler(async ({ input, context }) => {
      const user = await db.query.users.findFirst({
        where: and(
          eq(users.id, input.userId),
          eq(users.organizationId, context.session.organizationId),
        ),
      });
      return user;
    }),
};
```

### Error Handling

Implement consistent error responses:

```typescript
// Custom error types
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

// Error handler middleware
export const errorHandler = (error: Error, context: Context) => {
  securityAudit.logSecurityEvent({
    eventType: "api_error",
    outcome: "failure",
    details: { error: error.message },
    organizationId: context.session?.organizationId,
  });

  throw error;
};
```

### Custom Mutators

These are Zero mutators that run as part of the zero sync engine whenever we need to modify something in the database

```typescript
export const sendMessage = async (
  tx: Transaction,
  { conversationId, content }: { conversationId: string; content: string },
  { userID }: { userID: string },
) => {
  // Validate user can access conversation
  const conversation = await tx.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Create message
  const messageId = generateId();
  await tx.insert(messages).values({
    id: messageId,
    conversationId,
    content,
    senderId: userID,
    senderType: "user",
    createdAt: new Date(),
  });

  // Update conversation timestamp
  await tx
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return messageId;
};
```

## Testing Guidelines

Make sure to use the built in `node:test` test runner tools

### Integration Testing

Test API endpoints with authentication:

```typescript
import { auth } from "../src/lib/auth";

describe("User API", () => {
  beforeEach(async () => {
    // Setup test database
    await db.delete(users);
  });

  test("should get user profile", async () => {
    // Create test user
    const user = await auth.api.createUser({
      email: "test@example.com",
      name: "Test User",
    });

    // Test endpoint
    const response = await request(app)
      .get(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.name).toBe("Test User");
  });
});
```

## Performance Guidelines

### Database Optimization

- Use proper indexes on frequently queried columns
- Monitor query performance with EXPLAIN

### Monitoring

- Log all security events
- Monitor API response times
- Track authentication failures
- Set up alerting for critical errors

Remember: This server handles sensitive authentication data and must maintain the highest security standards. Always validate inputs, log security events, and follow the principle of least privilege.
