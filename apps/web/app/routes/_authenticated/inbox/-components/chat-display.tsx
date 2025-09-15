import { useState } from "react";
import { useQuery } from "@rocicorp/zero/react";
import { useRouter } from "@tanstack/react-router";
import { format } from "date-fns/format";
import { MoreVertical, Send } from "lucide-react";
import {
  getConversationQuery,
  getMessagesQuery,
} from "@solved-contact/backend/zero/get-queries";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@solved-contact/web-ui/components/avatar";
import { Button } from "@solved-contact/web-ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@solved-contact/web-ui/components/dropdown-menu";
import { Textarea } from "@solved-contact/web-ui/components/textarea";

interface ChatDisplayProps {
  conversationId: string;
}

export function ChatDisplay({ conversationId }: ChatDisplayProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { zero, session } = router.options.context;

  // Real-time conversation data
  const [conversationList] = useQuery(
    getConversationQuery(session.data, conversationId),
    {
      enabled: !!session.data,
    },
  );
  const conversation = conversationList[0]; // Get first (should be only one) conversation

  const [messages] = useQuery(getMessagesQuery(session.data, conversationId));

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Send message via Zero mutator
      zero.mutate.chat.sendMessage({
        conversationId,
        content: message,
      });

      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      // TODO: Show user-friendly error message (toast notification)
    } finally {
      setIsLoading(false);
    }
  }

  // Loading state - check if queries have returned data
  //   if (conversationList.length === 0) {
  //     return (
  //       <div className="flex h-full items-center justify-center">
  //         <div className="text-muted-foreground">Loading conversation...</div>
  //       </div>
  //     );
  //   }

  // Conversation not found
  //   if (!conversation) {
  //     return (
  //       <div className="flex h-full items-center justify-center">
  //         <div className="text-muted-foreground">Conversation not found</div>
  //       </div>
  //     );
  //   }

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage />
            <AvatarFallback>CU</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">Customer Chat</h3>
            <p className="text-muted-foreground text-sm">
              {conversation?.subject || "Conversation"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
            {conversation?.status}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Close conversation</DropdownMenuItem>
              <DropdownMenuItem>Transfer to agent</DropdownMenuItem>
              <DropdownMenuItem>Add note</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length > 0 ? (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground text-sm">
              No messages yet. Start the conversation!
            </div>
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="border-t p-4">
        <form className="flex gap-2" onSubmit={handleSendMessage}>
          <Textarea
            className="min-h-[60px] flex-1 resize-none"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type your message..."
            value={message}
          />
          <Button
            className="self-end"
            disabled={!message.trim() || isLoading}
            type="submit"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: {
    content: string;
    createdAt: number;
    id: string;
    senderType: string;
  };
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isFromUser = message.senderType === "user";

  return (
    <div className={`flex ${isFromUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[70%] items-start gap-2 ${
          isFromUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage />
          <AvatarFallback>{isFromUser ? "U" : "A"}</AvatarFallback>
        </Avatar>

        <div
          className={`rounded-lg px-4 py-2 ${
            isFromUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div
            className={`mt-1 text-xs ${
              isFromUser ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {format(new Date(message.createdAt), "HH:mm")}
          </div>
        </div>
      </div>
    </div>
  );
}
