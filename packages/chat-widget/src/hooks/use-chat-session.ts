import type { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/react";
import { useRouter } from "@tanstack/react-router";
import type { Mutators } from "@solved-contact/auth-server/zero/mutators";
import type { Schema } from "@solved-contact/auth-server/zero/schema";

// TODO: Implement proper conversation management
// Query to get conversations for the current chat session
// function conversationsQuery(
//   zero: Zero<Schema, Mutators>,
//   sessionId: string,
//   organizationId: string,
// ) {
//   return (
//     zero.query.conversations
//       .where("organizationId", organizationId)
//       // Find conversations where the chatUser has our sessionId
//       .related("chatUser", (chatUser) =>
//         chatUser.where("sessionId", sessionId).one(),
//       )
//       .orderBy("updatedAt", "desc")
//   );
// }

// Query to get messages for a specific conversation
function messagesQuery(zero: Zero<Schema, Mutators>, conversationId: string) {
  return zero.query.messages
    .where("conversationId", conversationId)
    .orderBy("createdAt", "asc");
}

// TODO: Implement conversation management
// Hook to get the current conversation for this chat session
// export function useCurrentConversation() {
//   const { zero } = useRouter().options.context;
//   const session = getOrCreateSession();

//   if (!session) {
//     throw new Error("Chat session not initialized");
//   }

//   const [conversations] = useQuery(
//     conversationsQuery(zero, session.sessionId, session.config.app_id),
//   );

//   // Return the most recent conversation for this session
//   return conversations.length > 0 ? conversations[0] : null;
// }

// Hook to get messages for the current conversation
export function useConversationMessages(conversationId: string | undefined) {
  const { zero } = useRouter().options.context;

  const [messages] = useQuery(
    conversationId
      ? messagesQuery(zero, conversationId)
      : zero.query.messages.where("id", "nonexistent"),
  );

  return conversationId ? messages : [];
}

// TODO: Implement proper chat session management
// Hook that combines conversation and messages for easy use
// export function useChatSession() {
//   const conversation = useCurrentConversation();
//   const messages = useConversationMessages(conversation?.id);

//   return {
//     conversation,
//     messages,
//     hasConversation: !!conversation,
//   };
// }
