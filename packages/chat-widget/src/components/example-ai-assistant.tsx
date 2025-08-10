import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useStore } from "@tanstack/react-store";
import { type UIMessage } from "ai";
import { Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { showAIAssistant } from "../store/example-assistant";
import { genAIResponse } from "../utils/demo.ai";
import GuitarRecommendation from "./example-guitar-recommendation";

function Messages({ messages }: { messages: UIMessage[] }) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        Ask me anything! I'm here to help.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" ref={messagesContainerRef}>
      {messages.map(({ id, role, content, parts }) => (
        <div
          className={`py-3 ${
            role === "assistant"
              ? "bg-gradient-to-r from-orange-500/5 to-red-600/5"
              : "bg-transparent"
          }`}
          key={id}
        >
          {content.length > 0 && (
            <div className="flex items-start gap-2 px-4">
              {role === "assistant" ? (
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-xs font-medium text-white">
                  AI
                </div>
              ) : (
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gray-700 text-xs font-medium text-white">
                  Y
                </div>
              )}
              <div className="min-w-0 flex-1">
                <ReactMarkdown
                  className="prose dark:prose-invert prose-sm max-w-none"
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
          )}
          {parts
            .filter((part) => part.type === "tool-invocation")
            .filter(
              (part) => part.toolInvocation.toolName === "recommendGuitar",
            )
            .map((toolCall) => (
              <div
                className="mx-auto max-w-[80%]"
                key={toolCall.toolInvocation.toolName}
              >
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- TODO: fix this */}
                <GuitarRecommendation id={toolCall.toolInvocation.args.id} />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default function AIAssistant() {
  const isOpen = useStore(showAIAssistant);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [],
    fetch: (_url, options) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-non-null-assertion -- TODO: fix this
      const { messages } = JSON.parse(options!.body! as string);
      return genAIResponse({
        data: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO: fix this
          messages,
        },
      });
    },
    // @ts-expect-error -- TODO: fix this
    onToolCall: (call) => {
      if (call.toolCall.toolName === "recommendGuitar") {
        return "Handled by the UI";
      }
    },
  });

  return (
    <div className="relative z-50">
      <button
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 text-white transition-opacity hover:opacity-90"
        onClick={() => showAIAssistant.setState((state) => !state)}
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-xs font-medium">
          AI
        </div>
        AI Assistant
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 flex h-[600px] w-[700px] flex-col rounded-lg border border-orange-500/20 bg-gray-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-orange-500/20 p-3">
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <button
              className="text-gray-400 transition-colors hover:text-white"
              onClick={() => showAIAssistant.setState((state) => !state)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Messages messages={messages} />

          <div className="border-t border-orange-500/20 p-3">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <textarea
                  className="w-full resize-none overflow-hidden rounded-lg border border-orange-500/20 bg-gray-800/50 py-2 pr-10 pl-3 text-sm text-white placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  onChange={handleInputChange}
                  onInput={(e) => {
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: fix this
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height =
                      Math.min(target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Type your message..."
                  rows={1}
                  style={{ minHeight: "36px", maxHeight: "120px" }}
                  value={input}
                />
                <button
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-orange-500 transition-colors hover:text-orange-400 focus:outline-none disabled:text-gray-500"
                  disabled={!input.trim()}
                  type="submit"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
