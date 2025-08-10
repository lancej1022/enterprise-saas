import { useEffect, useRef } from "react";
import { messagesCollection, type Message } from "@/db-collections";
import { type Collection } from "@tanstack/db";
import { useLiveQuery } from "@tanstack/react-db";

function useStreamConnection(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: fix this
  collection: Collection<any, any, any>,
) {
  const loadedRef = useRef(false);

  useEffect(() => {
    async function fetchData() {
      if (loadedRef.current) return;
      loadedRef.current = true;

      const response = await fetch(url);
      const reader = response.body?.getReader();
      if (!reader) {
        return;
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const chunk of decoder
          .decode(value, { stream: true })
          .split("\n")
          .filter((chunk) => chunk.length > 0)) {
          // eslint-disable-next-line react-you-might-not-need-an-effect/no-pass-data-to-parent -- TODO: fix this
          collection.insert(JSON.parse(chunk));
        }
      }
    }
    void fetchData();
    // eslint-disable-next-line react-hooks/react-compiler -- TODO: fix this
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: fix this
  }, []);
}

async function sendMessage(message: string, user: string) {
  await fetch("/demo/db-chat-api", {
    method: "POST",
    body: JSON.stringify({ text: message.trim(), user: user.trim() }),
  });
}
export function useChat() {
  useStreamConnection("/demo/db-chat-api", messagesCollection);

  return { sendMessage };
}

export function useMessages() {
  const { data: messages } = useLiveQuery((q) =>
    q.from({ message: messagesCollection }).select(({ message }) => ({
      ...message,
    })),
  );

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: fix this
  return messages as Message[];
}
