import { type CustomMutatorDefs } from "@rocicorp/zero";
import { nanoid } from "nanoid";

import { type DecodedJWT, type schema } from "./schema";

// TODO: generate this with Drizzle or something instead
function generateId() {
  return nanoid();
}

export function createMutators(authData: DecodedJWT | undefined) {
  return {
    chat: {
      sendMessage: async (
        tx,
        {
          conversationId,
          content,
          messageType = "text",
        }: {
          content: string;
          conversationId: string;
          messageType?: "file" | "image" | "text";
        },
      ) => {
        if (!authData) {
          throw new Error("Not authenticated");
        }

        // Client-side validation
        if (!content.trim()) {
          throw new Error("Message cannot be empty");
        }
        if (content.length > 5000) {
          throw new Error("Message too long");
        }

        // Check if conversation exists and user has access
        const conversation = await tx.query.conversations
          .where("id", conversationId)
          .where("organizationId", authData.activeOrganizationId)
          .one();

        if (!conversation) {
          throw new Error("Conversation not found or access denied");
        }

        // Determine sender type - check if user is an agent (member) for this org
        const member = await tx.query.members
          .where("organizationId", authData.activeOrganizationId)
          .where("userId", authData.sub)
          .one();

        // TODO: probably need better logic here. It seems that `member` is potentially undefined if it hasnt been queried on the client previously
        const senderType = member ? "agent" : "user";
        let senderId = "";

        // TODO: potentially simplify this to `if member`...?
        if (senderType === "agent" && member) {
          senderId = member.id;
        } else {
          // TODO: this whole `else` block `chatUser` stuff looks like it has a lot of flawed logic
          // Find or create chat user
          // const chatUser = await tx.query.chatUsers
          //   .where("userId", authData.sub)
          //   .where("organizationId", authData.activeOrganizationId)
          //   .one();
          // if (!chatUser) {
          //   const chatUserId = generateId();
          //   await tx.mutate.chatUsers.insert({
          //     id: chatUserId,
          //     organizationId: authData.activeOrganizationId,
          //     userId: authData.sub,
          //     createdAt: Date.now(),
          //     lastSeenAt: Date.now(),
          //   });
          //   senderId = chatUserId;
          // } else {
          //   senderId = chatUser.id;
          // }
        }

        const messageToInsert = {
          id: generateId(),
          conversationId,
          senderId,
          senderType,
          content: content.trim(),
          messageType,
          isRead: false,
          createdAt: Date.now(),
        };

        await tx.mutate.messages.insert(messageToInsert);

        // TODO: this should be something that can be automated via Postgres or Drizzle instead of requiring a manual update
        // Update conversation timestamp
        await tx.mutate.conversations.update({
          id: conversationId,
          updatedAt: Date.now(),
        });
      },

      // markAsRead: async (
      //   _tx,
      //   { conversationId: _conversationId }: { conversationId: string },
      // ) => {
      //   if (!authData) {
      //     throw new Error("Not authenticated");
      //   }

      //   // For now, just mark as read without complex querying
      //   // This will be enhanced later when we understand Zero's API better
      //   // TODO: Add proper verification and bulk update
      // },

      startConversation: async (
        tx,
        {
          subject,
          pageUrl,
          initialMessage,
        }: {
          initialMessage?: string;
          pageUrl?: string;
          subject?: string;
        },
      ) => {
        if (!authData) {
          throw new Error("Not authenticated");
        }

        // Create or get chat user
        let chatUser = await tx.query.chatUsers
          .where("userId", authData.sub)
          .where("organizationId", authData.activeOrganizationId)
          .one();

        if (!chatUser) {
          const chatUserId = generateId();
          await tx.mutate.chatUsers.insert({
            id: chatUserId,
            organizationId: authData.activeOrganizationId,
            userId: authData.sub,
            createdAt: Date.now(),
            lastSeenAt: Date.now(),
          });
          chatUser = {
            id: chatUserId,
            organizationId: authData.activeOrganizationId,
            userId: authData.sub,
            email: null,
            name: null,
            sessionId: null,
            userAgent: null,
            ipAddress: null,
            metadata: null,
            createdAt: Date.now(),
            lastSeenAt: Date.now(),
          };
        }

        // Create conversation
        const conversationId = generateId();
        await tx.mutate.conversations.insert({
          id: conversationId,
          organizationId: authData.activeOrganizationId,
          chatUserId: chatUser.id,
          status: "open",
          priority: "normal",
          subject,
          pageUrl,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        // Send initial message if provided
        if (initialMessage) {
          await tx.mutate.messages.insert({
            id: generateId(),
            conversationId,
            senderId: chatUser.id,
            senderType: "user",
            content: initialMessage,
            messageType: "text",
            isRead: false,
            createdAt: Date.now(),
          });
        }

        // Note: Zero mutators should return void, so we'll handle the result differently
        // The conversationId can be accessed through the query system after creation
      },
    },

    cart: {
      add: async (
        tx,
        { albumID, addedAt }: { addedAt: number; albumID: string },
      ) => {
        if (!authData) {
          throw new Error("Not authenticated");
        }
        try {
          await tx.mutate.cartItem.insert({
            userId: authData.sub,
            albumId: albumID,
            addedAt: tx.location === "client" ? addedAt : Date.now(),
          });
        } catch (err) {
          console.error("error adding cart item", err);
          throw err;
        }
      },

      remove: async (tx, albumId: string) => {
        if (!authData) {
          throw new Error("Not authenticated");
        }
        const cartItem = await tx.query.cartItem
          .where("userId", authData.sub)
          .where("albumId", albumId)
          .one();
        if (!cartItem) {
          return;
        }
        await tx.mutate.cartItem.delete({
          userId: cartItem.userId,
          albumId: cartItem.albumId,
        });
      },
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
