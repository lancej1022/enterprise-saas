import type { ComponentProps } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Badge } from "@solved-contact/web-ui/components/badge";
import { ScrollArea } from "@solved-contact/web-ui/components/scroll-area";
import { cn } from "@solved-contact/web-ui/lib/utils";

import type { Mail } from "./data";

interface ConversationListProps {
  items: Mail[];
}

export function ConversationList({ items }: ConversationListProps) {
  const conversationId = useParams({
    // TODO: unless we wire up auto-redirecting on route load then we cannot use `from` here because we're not guaranteed to have a path param
    // from: "/_authenticated/inbox/$conversationId",
    select: (params) => params["conversation-id"],
    strict: false,
  });

  return (
    <ScrollArea>
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <Link
            aria-label={
              // TODO: make sure item.name defaults to "anonymous" if not set
              item.name === "anonymous" ? item.subject : item.name
            }
            key={item.id}
            params={{ "conversation-id": item.id }}
            to="/inbox/$conversation-id"
          >
            <div
              className={cn(
                "hover:bg-accent flex w-full flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                conversationId === item.id && "bg-muted",
              )}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{item.name}</div>
                    {!item.read && (
                      <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "ml-auto text-xs",
                      conversationId === item.id
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatDistanceToNow(new Date(item.date), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div className="text-xs font-medium">{item.subject}</div>
              </div>
              <div className="text-muted-foreground line-clamp-2 text-xs">
                {item.text.substring(0, 300)}
              </div>
              {item.labels.length ? (
                <div className="flex items-center gap-2">
                  {item.labels.map((label) => (
                    <Badge
                      key={label}
                      variant={getBadgeVariantFromLabel(label)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
}

function getBadgeVariantFromLabel(
  label: string,
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}
