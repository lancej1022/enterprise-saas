# Chat Widget Implementation TODO

This file contains the next steps to complete the chat widget implementation after the foundational work has been completed.

## Current Status ✅

The following has been successfully implemented:

- ✅ **Database Schema**: Chat tables added to auth-server and integrated with Zero
- ✅ **Zero Integration**: Schema generated, permissions configured, types exported
- ✅ **Basic Mutators**: `sendMessage` and `startConversation` mutators created
- ✅ **UI Components**: `ChatDisplay` component with modern chat interface
- ✅ **Route Updates**: Inbox route updated to use chat display instead of mail display
- ✅ **Mock Data**: Basic UI working with temporary mock data

## Next Steps 🚀

### Step 2:Connect Zero Real Queries

**Tasks:**

3. **Re-enable Chat Permissions**

   ```typescript
   // Add back to permissions config:
   chatUsers: {
     row: { select: [allowIfSameOrganization] },
   },
   conversations: {
     row: { select: [allowIfConversationParticipant] },
   },
   messages: {
     row: { select: [allowIfInConversation] },
   },
   ```

### Step 3: Connect Real Zero Queries to UI

**Priority**: High  
**Status**: Pending

**Tasks:**

1. **Replace Mock Data with Zero Queries**

   ```typescript
   // In chat-display.tsx
   import { useQuery } from "@rocicorp/zero/react";
   import { useRouter } from "@tanstack/react-router";

   export function ChatDisplay({ conversationId }: ChatDisplayProps) {
     const router = useRouter();
     const { zero } = router.options.context;

     // Real-time conversation data
     const conversation = useQuery(zero.query.conversations
       .where("id", conversationId)
       .one()
     );

     // Real-time messages
     const messages = useQuery(zero.query.messages
       .where("conversationId", conversationId)
       .orderBy("createdAt", "asc")
       .all()
     );
   ```

2. **Connect Send Message to Real Mutator**

   ```typescript
   const handleSendMessage = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!message.trim() || isLoading) return;

     setIsLoading(true);
     try {
       await zero.mutate.chat.sendMessage({
         conversationId,
         content: message,
       });
       setMessage("");
     } catch (error) {
       console.error("Failed to send message:", error);
       // Show error toast
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. **Add Real-time Message Updates**
   - Remove optimistic update code (Zero handles this automatically)
   - Add loading states for messages
   - Handle error states properly

### Step 4: Test Database Operations

**Priority**: High  
**Status**: Pending

**Tasks:**

1. **Test Conversation Creation**
   - Create a test page or button to trigger `startConversation`
   - Verify conversations are created in database
   - Check that chat_users are created properly

2. **Test Message Sending**
   - Send test messages through the UI
   - Verify messages appear in database with correct relationships
   - Test both user and agent message sending

3. **Test Agent vs User Detection**
   - Test with users who are members of organizations (agents)
   - Test with users who are not members (regular chat users)
   - Verify correct sender types and IDs

4. **Test Multi-tenant Isolation**
   - Create conversations in different organizations
   - Verify users can only see their organization's data
   - Test permission boundaries

### Step 5: Add File Attachments

**Priority**: Medium  
**Status**: Pending

**Tasks:**

1. **Create File Upload Component**

   ```typescript
   // New component: FileUpload.tsx
   interface FileUploadProps {
     onFileSelect: (file: File) => void;
     accept?: string;
     maxSize?: number;
   }
   ```

2. **Add File Upload to Chat Input**
   - Add paperclip icon button next to send button
   - Handle file selection and validation
   - Show file preview before sending

3. **Implement File Storage**
   - Set up file storage (S3, Cloudinary, or local)
   - Create file upload endpoint
   - Generate secure file URLs

4. **Create File Mutator**

   ```typescript
   sendFile: async (
     tx,
     { conversationId, fileUrl, fileName, fileSize, mimeType },
   ) => {
     // Create message with attachment
     const messageId = generateId();
     await tx.mutate.messages.insert({
       id: messageId,
       conversationId,
       messageType: "file",
       content: fileName,
       // ... other fields
     });

     // Create attachment record
     await tx.mutate.attachments.insert({
       id: generateId(),
       messageId,
       fileName,
       fileSize,
       mimeType,
       url: fileUrl,
     });
   };
   ```

5. **Update UI for File Messages**
   - Create FileMessage component
   - Handle different file types (images, documents, etc.)
   - Add download functionality

### Step 6: Enhance Agent Features

**Priority**: Medium  
**Status**: Pending

**Tasks:**

1. **Add Conversation Status Management**

   ```typescript
   updateConversationStatus: async (
     tx,
     {
       conversationId,
       status,
     }: {
       conversationId: string;
       status: "open" | "closed" | "waiting" | "resolved";
     },
   ) => {
     await tx.mutate.conversations.update({
       id: conversationId,
       status,
       updatedAt: Date.now(),
     });
   };
   ```

2. **Add Agent Assignment**

   ```typescript
   assignAgent: async (tx, { conversationId, agentId }) => {
     // Update conversation
     await tx.mutate.conversations.update({
       id: conversationId,
       assignedAgentId: agentId,
       updatedAt: Date.now(),
     });

     // Create assignment record
     await tx.mutate.conversationAssignments.insert({
       id: generateId(),
       conversationId,
       agentId,
       assignedAt: Date.now(),
       reason: "manual",
     });
   };
   ```

3. **Add Typing Indicators**
   - Implement typing state management
   - Show "Agent is typing..." indicators
   - Use temporary state (not persisted to DB)

4. **Add Agent Dashboard**
   - Create agent view for managing multiple conversations
   - Show conversation list with unread counts
   - Quick assignment and status change controls

## Development Notes 📝

### Known Issues

- Zero type errors in mutators need investigation
- Permission functions need relationship fixes
- Mock data currently used instead of real queries

### Database Schema Notes

- Chat tables are in `apps/auth-server/src/db/schema/chat.ts`
- Exported to web app via `apps/web/db/schema.ts`
- Zero schema auto-generated in `apps/web/zero/schema.gen.ts`

### File Structure

```
apps/web/
├── app/routes/_authenticated/inbox/
│   ├── $conversationId.tsx          # Updated to use ChatDisplay
│   └── -components/
│       ├── chat-display.tsx         # Main chat interface
│       └── mail-display.tsx         # Original (now unused)
├── zero/
│   ├── schema.ts                    # Zero config with permissions
│   ├── schema.gen.ts                # Auto-generated schema
│   └── mutators.ts                  # Chat mutators
└── CHAT_IMPLEMENTATION_TODO.md      # This file
```

### Testing Strategy

1. Start with Step 2 (fix type issues)
2. Test basic conversation creation
3. Test message sending with real data
4. Add file attachments once core works
5. Build out agent features last

### Reference Links

- [Zero Custom Mutators Docs](https://zero.rocicorp.dev/docs/custom-mutators)
- [Zero Permissions Guide](https://zero.rocicorp.dev/docs/permissions)
- [Drizzle ORM Relations](https://orm.drizzle.team/docs/rqb#select-with-relations)

---

**Last Updated**: July 30, 2025  
**Status**: Foundation complete, ready for Steps 2-6
