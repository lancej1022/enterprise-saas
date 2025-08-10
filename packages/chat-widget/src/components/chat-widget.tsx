import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { MessageCircle, Minimize2, Send, X } from "lucide-react";
import { Button } from "@solved-contact/ui/components/button";
import { Card } from "@solved-contact/ui/components/card";
import { Input } from "@solved-contact/ui/components/input";
import { cn } from "@solved-contact/ui/lib/utils";

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

const suggestedQuestions = [
  "What services do you offer?",
  "How can I get started?",
  "What are your pricing plans?",
  "Do you offer customer support?",
  "How do I contact sales?",
];

export function ChatWidget({ isOpen, onToggle }: ChatWidgetProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  function handleSuggestedQuestion(question: string) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- from v0
    const syntheticEvent = {
      preventDefault: () => {
        return;
      },
      target: { value: question },
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(syntheticEvent);

    setTimeout(() => {
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any -- from v0
      handleSubmit(submitEvent as any);
    }, 100);
  }

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        className={cn(
          "fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          isOpen
            ? "bg-slate-600 hover:bg-slate-700"
            : "bg-emerald-600 hover:bg-emerald-700",
        )}
        onClick={onToggle}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chat Widget */}
      <div
        className={cn(
          "fixed right-6 bottom-24 z-40 w-96 max-w-[calc(100vw-3rem)] transition-all duration-300",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <Card className="overflow-hidden border-0 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-emerald-600 p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">Support Assistant</h3>
                <p className="text-sm text-emerald-100">We're here to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
                size="sm"
                variant="ghost"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={onToggle}
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              isMinimized ? "h-0" : "h-96",
            )}
          >
            {/* Messages */}
            <div className="h-80 space-y-4 overflow-y-auto bg-slate-50 p-4">
              {!hasMessages && (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <MessageCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="mb-2 font-semibold text-slate-800">
                    👋 Hi! How can we help you today?
                  </h4>
                  <p className="mb-4 text-sm text-slate-600">
                    Ask us anything or choose from these common questions:
                  </p>
                  <div className="space-y-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        className="h-auto w-full justify-start border-emerald-200 px-3 py-2 text-left text-emerald-700 hover:bg-emerald-50"
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        size="sm"
                        variant="outline"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                  key={message.id}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                      message.role === "user"
                        ? "rounded-br-md bg-emerald-600 text-white"
                        : "rounded-bl-md border bg-white text-slate-800 shadow-sm",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border bg-white px-4 py-2 text-sm text-slate-800 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t bg-white p-4">
              <form className="flex space-x-2" onSubmit={handleSubmit}>
                <Input
                  className="flex-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isLoading}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  ref={inputRef}
                  value={input}
                />
                <Button
                  className="bg-emerald-600 px-3 hover:bg-emerald-700"
                  disabled={isLoading || !input.trim()}
                  type="submit"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="mt-2 text-center text-xs text-slate-500">
                Powered by AI • We're here to help 24/7
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
