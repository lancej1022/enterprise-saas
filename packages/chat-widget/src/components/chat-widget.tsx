import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import {
  AlertTriangle,
  MessageCircle,
  Minimize2,
  Send,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@solved-contact/web-ui/components/button";
import { Card } from "@solved-contact/web-ui/components/card";
import { Input } from "@solved-contact/web-ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@solved-contact/web-ui/components/popover";
import { cn } from "@solved-contact/web-ui/lib/utils";

import { useChatSecurity } from "../hooks/use-chat-security";

const suggestedQuestions = [
  "What services do you offer?",
  "How can I get started?",
  "What are your pricing plans?",
  "Do you offer customer support?",
  "How do I contact sales?",
];

interface ChatWidgetProps {
  domain?: string; // Optional domain override (defaults to auto-detection)
  onSecurityError?: (error: string, code: string) => void;
  organizationId: string;
  userJWT?: string;
}

export function ChatWidget({
  organizationId,
  userJWT,
  domain,
  onSecurityError,
}: ChatWidgetProps) {
  const {
    isInitialized,
    isLoading: isSecurityLoading,
    error: securityError,
    securityLevel,
    sessionInfo,
    retry: retrySecurity,
  } = useChatSecurity({
    organizationId,
    userJWT,
    domain,
    onSecurityError,
    autoRetry: true,
  });

  // TODO: remove this shit
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: `${import.meta.env.VITE_SERVER_URL}/api/chat`,
      headers: sessionInfo?.sessionToken
        ? {
            Authorization: `Bearer ${sessionInfo.sessionToken}`,
          }
        : undefined,
    });

  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // Focus input when popover opens and is not minimized
  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    // TODO: how can this be done without setTimeout? The original setTimeout comes from Claude, but removing it does break the autofocus
    if (open && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }

  function handleSuggestedQuestion(question: string) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- from v0
    const syntheticEvent = {
      preventDefault: () => {
        return;
      },
      target: { value: question },
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(syntheticEvent);

    // TODO: This looks like AI BS
    void Promise.resolve().then(() => {
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any -- from v0
      handleSubmit(submitEvent as any);
    });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const hasMessages = messages.length > 0;

  // Security status indicators
  function renderSecurityStatus() {
    if (isSecurityLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 animate-pulse text-emerald-600" />
            <span className="text-sm text-slate-600">
              Initializing secure connection...
            </span>
          </div>
        </div>
      );
    }

    if (securityError && !isInitialized) {
      return (
        <div className="p-4 text-center">
          <div className="mb-3 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h4 className="mb-2 font-semibold text-slate-800">Security Error</h4>
          <p className="mb-4 text-sm text-slate-600">{securityError}</p>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => void retrySecurity()}
            size="sm"
          >
            Retry Connection
          </Button>
        </div>
      );
    }

    return null;
  }

  const showSecurityStatus =
    isSecurityLoading || (securityError && !isInitialized);

  return (
    <Popover onOpenChange={handleOpenChange} open={isOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            "pointer-events-auto",
            isOpen
              ? "bg-slate-600 hover:bg-slate-700"
              : "bg-emerald-600 hover:bg-emerald-700",
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-96 max-w-[calc(100vw-3rem)] border-0 bg-transparent p-0 shadow-none"
        side="top"
        sideOffset={8}
      >
        <Card className="overflow-hidden border-0 shadow-2xl">
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
                onClick={() => setIsOpen(false)}
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              isMinimized ? "h-0" : "h-96",
            )}
          >
            <div className="h-80 space-y-4 overflow-y-auto bg-slate-50 p-4">
              {showSecurityStatus ? (
                renderSecurityStatus()
              ) : !hasMessages && isInitialized ? (
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
              ) : null}

              {isInitialized &&
                messages.map((message) => (
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

              {isInitialized && isLoading && (
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

            <div className="border-t bg-white p-4">
              <form className="flex space-x-2" onSubmit={handleSubmit}>
                <Input
                  className="flex-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={!isInitialized || isLoading}
                  onChange={handleInputChange}
                  placeholder={
                    !isInitialized ? "Connecting..." : "Type your message..."
                  }
                  ref={inputRef}
                  value={input}
                />
                <Button
                  className="bg-emerald-600 px-3 hover:bg-emerald-700"
                  disabled={!isInitialized || isLoading || !input.trim()}
                  type="submit"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <div className="mt-2 flex items-center justify-between text-xs">
                <p className="text-slate-500">
                  Powered by AI • We're here to help 24/7
                </p>
                {securityLevel && (
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Shield className="h-3 w-3" />
                    <span className="capitalize">{securityLevel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
