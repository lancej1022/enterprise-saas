import { useQuery } from "@rocicorp/zero/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getConversationsQuery } from "@solved-contact/backend/zero/get-queries";

import { Conversations } from "./-components/mail";

export const Route = createFileRoute("/_authenticated/inbox")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MailPage />;
}

function Image(props: React.ComponentProps<"img">) {
  return <img alt={props.alt ?? "placeholder"} {...props} />;
}

function MailPage() {
  const router = useRouter();
  const { session } = router.options.context;

  // Get conversations for the current organization
  const [conversations] = useQuery(getConversationsQuery(session.data), {
    enabled: !!session.data,
  });

  // Show loading state when no data
  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">No conversations found</div>
      </div>
    );
  }

  // Transform conversations to match component's expected format
  const conversationList = conversations.map((conv) => {
    let labels: string[] = [conv.status];
    if (conv.tags) {
      try {
        const parsedTags: unknown = JSON.parse(conv.tags);
        if (
          Array.isArray(parsedTags) &&
          parsedTags.every((tag): tag is string => typeof tag === "string")
        ) {
          labels = parsedTags;
        }
      } catch {
        // If parsing fails, use default status label
      }
    }

    return {
      id: conv.id,
      name: conv.chatUser?.name || conv.subject || "Chat Conversation",
      email: conv.chatUser?.email || "",
      subject: conv.subject || `Conversation ${conv.id.slice(0, 8)}`,
      text: `Status: ${conv.status} | Priority: ${conv.priority}`,
      date: new Date(conv.updatedAt).toISOString(),
      read: conv.status !== "open", // Mark open conversations as unread
      labels,
    };
  });

  return (
    <>
      <div className="md:hidden">
        <Image
          alt="Mail"
          className="hidden dark:block"
          height={727}
          src="/examples/mail-dark.png"
          width={1280}
        />
        <Image
          alt="Mail"
          className="block dark:hidden"
          height={727}
          src="/examples/mail-light.png"
          width={1280}
        />
      </div>
      <div className="hidden flex-col md:flex">
        <Conversations conversations={conversationList} />
      </div>
    </>
  );
}
