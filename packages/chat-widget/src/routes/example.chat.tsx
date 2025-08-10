import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { type UIMessage } from "ai";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { genAIResponse } from "../utils/demo.ai";

import "../demo.index.css";

function InitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="mx-auto w-full max-w-3xl text-center">
        <h1 className="mb-4 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-6xl font-bold text-transparent uppercase">
          <span className="text-white">TanStack</span> Chat
        </h1>
        <p className="mx-auto mb-6 w-2/3 text-lg text-gray-400">
          You can ask me about anything, I might or might not have a good
          answer, but you can still ask.
        </p>
        {children}
      </div>
    </div>
  );
}

function ChattingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute right-0 bottom-0 left-64 border-t border-orange-500/10 bg-gray-900/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-3xl px-4 py-3">{children}</div>
    </div>
  );
}

function Messages({ messages }: { messages: UIMessage[] }) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages.length) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24" ref={messagesContainerRef}>
      <div className="mx-auto w-full max-w-3xl px-4">
        {messages.map(({ id, role, content }) => (
          <div
            className={`py-6 ${
              role === "assistant"
                ? "bg-gradient-to-r from-orange-500/5 to-red-600/5"
                : "bg-transparent"
            }`}
            key={id}
          >
            <div className="mx-auto flex w-full max-w-3xl items-start gap-4">
              {role === "assistant" ? (
                <div className="mt-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-sm font-medium text-white">
                  AI
                </div>
              ) : (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-700 text-sm font-medium text-white">
                  Y
                </div>
              )}
              <div className="min-w-0 flex-1">
                <ReactMarkdown
                  className="prose dark:prose-invert max-w-none"
                  rehypePlugins={[
                    rehypeRaw,
                    rehypeSanitize,
                    rehypeHighlight,
                    remarkGfm,
                  ]}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [],
    fetch: (_url, options) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion -- this is a demo
      const { messages } = JSON.parse(options!.body! as string);
      return genAIResponse({
        data: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- this is a demo
          messages,
        },
      });
    },
  });

  const Layout = messages.length ? ChattingLayout : InitalLayout;

  return (
    <div className="relative flex h-[calc(100vh-32px)] bg-gray-900">
      <div className="flex flex-1 flex-col">
        <Messages messages={messages} />

        <Layout>
          <form onSubmit={handleSubmit}>
            <div className="relative mx-auto max-w-xl">
              <textarea
                className="w-full resize-none overflow-hidden rounded-lg border border-orange-500/20 bg-gray-800/50 py-3 pr-12 pl-4 text-sm text-white placeholder-gray-400 shadow-lg focus:border-transparent focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                onChange={handleInputChange}
                onInput={(e) => {
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- this is a demo
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 200) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type something clever (or don't, we won't judge)..."
                rows={1}
                style={{ minHeight: "44px", maxHeight: "200px" }}
                value={input}
              />
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-orange-500 transition-colors hover:text-orange-400 focus:outline-none disabled:text-gray-500"
                disabled={!input.trim()}
                type="submit"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </Layout>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/example/chat")({
  component: ChatPage,
});
