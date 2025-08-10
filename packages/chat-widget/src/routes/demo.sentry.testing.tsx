/**
 * FILE OVERVIEW:
 * Purpose: Interactive demo page showcasing Sentry's monitoring capabilities
 * Key Concepts: Error tracking, Performance monitoring, Session replay
 * Module Type: Route Component
 * @ai_context: Demonstrates Sentry features through interactive examples with educational context
 */

import * as fs from "node:fs/promises";
import { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/tanstackstart-react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/demo/sentry/testing")({
  component: RouteComponent,
});

// Server function that will error
const badServerFunc = createServerFn({
  method: "GET",
}).handler(async () => {
  return await Sentry.startSpan(
    {
      name: "Reading non-existent file",
      op: "file.read",
    },
    async () => {
      try {
        await fs.readFile("./doesnt-exist", "utf-8");
        return true;
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    },
  );
});

// Server function that will succeed but be traced
const goodServerFunc = createServerFn({
  method: "GET",
}).handler(async () => {
  return await Sentry.startSpan(
    {
      name: "Successful server operation",
      op: "demo.success",
    },
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
  );
});

function RouteComponent() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [hasError, setHasError] = useState<Record<string, boolean>>({});
  const [showTrace, setShowTrace] = useState<Record<string, boolean>>({});
  const [spanOps, setSpanOps] = useState<Record<string, string>>({});
  const [demoStep, setDemoStep] = useState(0);
  const [_replayEvents, setReplayEvents] = useState<string[]>([]);
  const [copiedSpan, setCopiedSpan] = useState<null | string>(null);
  const startTimeRef = useRef<string>("");

  useEffect(() => {
    // Set initial timestamp only once on client
    if (!startTimeRef.current) {
      startTimeRef.current = new Date().toISOString();
    }

    // eslint-disable-next-line react-you-might-not-need-an-effect/no-event-handler -- this is a demo
    if (demoStep > 0) {
      const secondsElapsed = (
        (new Date().getTime() - new Date(startTimeRef.current).getTime()) /
        1000
      ).toFixed(1);
      setReplayEvents((prev) => [
        ...prev,
        `Step ${demoStep}: +${secondsElapsed}s`,
      ]);
    }
  }, [demoStep]);

  function handleCopy(operation: string) {
    void navigator.clipboard.writeText(operation);
    setCopiedSpan(operation);
    setTimeout(() => setCopiedSpan(null), 2000);
  }

  async function handleClientError() {
    setIsLoading((prev) => ({ ...prev, clientError: true }));
    setHasError((prev) => ({ ...prev, clientError: false }));
    setShowTrace((prev) => ({ ...prev, clientError: true }));

    try {
      await Sentry.startSpan(
        {
          name: "Client Error Flow Demo",
          op: "demo.client-error-flow",
        },
        // eslint-disable-next-line @typescript-eslint/require-await -- from tsrouter cli
        async () => {
          Sentry.setContext("demo", {
            feature: "client-error-demo",
            triggered_at: new Date().toISOString(),
          });

          // Simulate a client-side error
          throw new Error("Client-side error demonstration");
        },
      );
    } catch (error) {
      setHasError((prev) => ({ ...prev, clientError: true }));
      setSpanOps((prev) => ({
        ...prev,
        clientError: "demo.client-error-flow",
      }));
      Sentry.captureException(error);
    } finally {
      setIsLoading((prev) => ({ ...prev, clientError: false }));
    }
  }

  async function handleServerError() {
    setIsLoading((prev) => ({ ...prev, serverError: true }));
    setHasError((prev) => ({ ...prev, serverError: false }));
    setShowTrace((prev) => ({ ...prev, serverError: true }));

    try {
      await Sentry.startSpan(
        {
          name: "Server Error Flow Demo",
          op: "demo.server-error-flow",
        },
        async () => {
          Sentry.setContext("demo", {
            feature: "server-error-demo",
            triggered_at: new Date().toISOString(),
          });

          await badServerFunc();
        },
      );
    } catch (error) {
      setHasError((prev) => ({ ...prev, serverError: true }));
      setSpanOps((prev) => ({
        ...prev,
        serverError: "demo.server-error-flow",
      }));
      Sentry.captureException(error);
    } finally {
      setIsLoading((prev) => ({ ...prev, serverError: false }));
    }
  }

  async function handleClientTrace() {
    setIsLoading((prev) => ({ ...prev, client: true }));
    setShowTrace((prev) => ({ ...prev, client: true }));

    await Sentry.startSpan(
      {
        name: "Client Operation",
        op: "demo.client",
      },
      async () => {
        // Simulate some client-side work
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
    );

    setSpanOps((prev) => ({ ...prev, client: "demo.client" }));
    setIsLoading((prev) => ({ ...prev, client: false }));
  }

  async function handleServerTrace() {
    setIsLoading((prev) => ({ ...prev, server: true }));
    setShowTrace((prev) => ({ ...prev, server: true }));

    try {
      await Sentry.startSpan(
        {
          name: "Server Operation",
          op: "demo.server",
        },
        async () => {
          await goodServerFunc();
        },
      );
      setSpanOps((prev) => ({ ...prev, server: "demo.server" }));
    } finally {
      setIsLoading((prev) => ({ ...prev, server: false }));
    }
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
          }
          .animate-fade-out {
            animation: fadeOut 2s ease-out forwards;
          }
        `,
        }}
      />
      <div
        className="min-h-[calc(100vh-32px)] p-8 text-white"
        style={{
          backgroundImage:
            "radial-gradient(41.11% 49.93% at 50% 49.93%, #8d5494 0%, #563275 52.26%, #1f1633 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-8xl font-bold text-white">Sentry</h1>
            <p className="text-4xl font-semibold text-white">
              Code <span className="inline-block -rotate-9">breaks</span>, fix
              it faster
            </p>
          </div>

          {/* Content Grid */}
          <div className="space-y-8">
            {/* Information Section - Top */}
            <div className="rounded-lg border border-gray-800 bg-[#1C2333] p-6">
              <div className="space-y-4 text-gray-300">
                <p>
                  The Sentry integration monitors this application across all
                  routes; not just this one (we care about all tabs) using our{" "}
                  <code>@sentry/react</code> and <code>@sentry/node</code>{" "}
                  packages.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg border border-gray-700 bg-[#2D3555] p-4 transition-colors hover:border-purple-500/50">
                    <div className="mb-1 font-bold">Error Monitoring</div>
                    <div className="text-sm text-gray-400">
                      across client side and server functions
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-[#2D3555] p-4 transition-colors hover:border-purple-500/50">
                    <div className="mb-1 font-bold">Tracing and Spans</div>
                    <div className="text-sm text-gray-400">
                      for client and server side performance
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-[#2D3555] p-4 transition-colors hover:border-purple-500/50">
                    <div className="mb-1 font-bold">Session replay</div>
                    <div className="text-sm text-gray-400">
                      real user session playback
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-[#2D3555] p-4 transition-colors hover:border-purple-500/50">
                    <div className="mb-1 font-bold">Real-time alerts</div>
                    <div className="text-sm text-gray-400">
                      because sleep is overrated anyway
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testing Sections - Bottom Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Client Side Testing */}
              <div className="rounded-lg border border-gray-800 bg-[#1C2333] p-6">
                <h2 className="mb-6 text-xl font-semibold text-white">
                  Client-Side Testing
                </h2>
                <div className="space-y-6">
                  <div>
                    <button
                      className="group relative w-full overflow-hidden rounded-md p-4 text-white"
                      onClick={() => {
                        setDemoStep((prev) => prev + 1);
                        void handleClientError();
                      }}
                      style={{
                        background:
                          "linear-gradient(120deg, #c83852, #b44092 25%, #6a5fc1 50%, #452650 55%, #452650)",
                        backgroundPosition: "2% 0",
                        backgroundSize: "250% 100%",
                      }}
                      type="button"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="relative">
                        <div className="mb-2 flex items-center">
                          <span className="font-medium">
                            Trigger Client-Side Error
                          </span>
                        </div>
                      </div>
                    </button>
                    {hasError.clientError && (
                      <div className="mt-4 space-y-2">
                        <div className="rounded-lg border border-red-500/50 bg-red-900/20 p-2">
                          <div className="flex items-center text-sm text-red-400">
                            <svg
                              className="mr-2 h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <title>Red Warning Sign</title>
                              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Client-side error captured and traced
                          </div>
                        </div>
                        <div className="rounded-lg border border-purple-500/50 bg-purple-900/20 p-3">
                          <div className="flex items-center justify-between">
                            <div className="relative">
                              <button
                                className={`inline-flex cursor-pointer items-center rounded-lg border border-purple-500/50 bg-purple-900/40 px-3 py-1.5 transition-all hover:bg-purple-900/60 ${copiedSpan === spanOps.clientError ? "scale-95" : ""}`}
                                onClick={() =>
                                  handleCopy(spanOps.clientError ?? "")
                                }
                                title="Click to copy operation name"
                                type="button"
                              >
                                <span className="mr-2 text-sm font-medium text-purple-300">
                                  span.op
                                </span>
                                <code className="font-mono text-sm text-purple-400">
                                  {spanOps.clientError}
                                </code>
                              </button>
                              {copiedSpan === spanOps.clientError && (
                                <div className="animate-fade-out absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-green-500/90 px-2 py-1 text-xs text-white">
                                  Copied!
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      className="group relative w-full overflow-hidden rounded-md p-4 text-white"
                      onClick={() => {
                        setDemoStep((prev) => prev + 1);
                        void handleClientTrace();
                      }}
                      style={{
                        background:
                          "linear-gradient(120deg, #c83852, #b44092 25%, #6a5fc1 50%, #452650 55%, #452650)",
                        backgroundPosition: "2% 0",
                        backgroundSize: "250% 100%",
                      }}
                      type="button"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="relative">
                        <div className="mb-2 flex items-center">
                          <span className="font-medium">
                            Test Client-Side Span
                          </span>
                        </div>
                      </div>
                    </button>
                    {showTrace.client && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center">
                          <div
                            className={`h-3 w-3 rounded-full ${isLoading.client ? "animate-pulse bg-blue-500" : "bg-green-500"}`}
                          />
                          <div className="ml-2 flex-1">
                            <div className="h-1.5 rounded bg-[#2D3555]">
                              <div
                                className="h-full rounded bg-blue-500 transition-all duration-500"
                                style={{
                                  width: isLoading.client ? "60%" : "100%",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        {!isLoading.client && spanOps.client && (
                          <div className="rounded-lg border border-purple-500/50 bg-purple-900/20 p-3">
                            <div className="flex items-center justify-between">
                              <div className="relative">
                                <button
                                  className={`inline-flex cursor-pointer items-center rounded-lg border border-purple-500/50 bg-purple-900/40 px-3 py-1.5 transition-all hover:bg-purple-900/60 ${copiedSpan === spanOps.client ? "scale-95" : ""}`}
                                  onClick={() =>
                                    handleCopy(spanOps.client ?? "")
                                  }
                                  title="Click to copy operation name"
                                  type="button"
                                >
                                  <span className="mr-2 text-sm font-medium text-purple-300">
                                    span.op
                                  </span>
                                  <code className="font-mono text-sm text-purple-400">
                                    {spanOps.client}
                                  </code>
                                </button>
                                {copiedSpan === spanOps.client && (
                                  <div className="animate-fade-out absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-green-500/90 px-2 py-1 text-xs text-white">
                                    Copied!
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Server Side Testing */}
              <div className="rounded-lg border border-gray-800 bg-[#1C2333] p-6">
                <h2 className="mb-6 text-xl font-semibold text-white">
                  Server-Side Testing
                </h2>
                <div className="space-y-6">
                  <div>
                    <button
                      className="group relative w-full overflow-hidden rounded-md p-4 text-white"
                      onClick={() => {
                        setDemoStep((prev) => prev + 1);
                        void handleServerError();
                      }}
                      style={{
                        background:
                          "linear-gradient(120deg, #c83852, #b44092 25%, #6a5fc1 50%, #452650 55%, #452650)",
                        backgroundPosition: "2% 0",
                        backgroundSize: "250% 100%",
                      }}
                      type="button"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="relative">
                        <div className="mb-2 flex items-center">
                          <span className="font-medium">
                            Trigger Server Error
                          </span>
                        </div>
                      </div>
                    </button>
                    {hasError.serverError && (
                      <div className="mt-4 space-y-2">
                        <div className="rounded-lg border border-red-500/50 bg-red-900/20 p-3">
                          <div className="flex items-center text-sm text-red-400">
                            <svg
                              className="mr-2 h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <title>Red Warning Sign</title>
                              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Server-side error captured and traced
                          </div>
                        </div>
                        <div className="rounded-lg border border-purple-500/50 bg-purple-900/20 p-3">
                          <div className="flex items-center justify-between">
                            <div className="relative">
                              <button
                                className={`inline-flex cursor-pointer items-center rounded-lg border border-purple-500/50 bg-purple-900/40 px-3 py-1.5 transition-all hover:bg-purple-900/60 ${copiedSpan === spanOps.serverError ? "scale-95" : ""}`}
                                onClick={() =>
                                  handleCopy(spanOps.serverError ?? "")
                                }
                                title="Click to copy operation name"
                                type="button"
                              >
                                <span className="mr-2 text-sm font-medium text-purple-300">
                                  span.op
                                </span>
                                <code className="font-mono text-sm text-purple-400">
                                  {spanOps.serverError}
                                </code>
                              </button>
                              {copiedSpan === spanOps.serverError && (
                                <div className="animate-fade-out absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-green-500/90 px-2 py-1 text-xs text-white">
                                  Copied!
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      className="group relative w-full overflow-hidden rounded-md p-4 text-white"
                      onClick={() => {
                        setDemoStep((prev) => prev + 1);
                        void handleServerTrace();
                      }}
                      style={{
                        background:
                          "linear-gradient(120deg, #c83852, #b44092 25%, #6a5fc1 50%, #452650 55%, #452650)",
                        backgroundPosition: "2% 0",
                        backgroundSize: "250% 100%",
                      }}
                      type="button"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="relative">
                        <div className="mb-2 flex items-center">
                          <span className="font-medium">Test server Trace</span>
                        </div>
                      </div>
                    </button>
                    {showTrace.server && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center">
                          <div
                            className={`h-3 w-3 rounded-full ${isLoading.server ? "animate-pulse bg-purple-500" : "bg-green-500"}`}
                          />
                          <div className="ml-2 flex-1">
                            <div className="h-1.5 rounded bg-[#2D3555]">
                              <div
                                className="h-full rounded bg-purple-500 transition-all duration-500"
                                style={{
                                  width: isLoading.server ? "60%" : "100%",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        {!isLoading.server && spanOps.server && (
                          <div className="rounded-lg border border-purple-500/50 bg-purple-900/20 p-3">
                            <div className="flex items-center justify-between">
                              <div className="relative">
                                <button
                                  className={`inline-flex cursor-pointer items-center rounded-lg border border-purple-500/50 bg-purple-900/40 px-3 py-1.5 transition-all hover:bg-purple-900/60 ${copiedSpan === spanOps.server ? "scale-95" : ""}`}
                                  onClick={() =>
                                    handleCopy(spanOps.server ?? "")
                                  }
                                  title="Click to copy operation name"
                                  type="button"
                                >
                                  <span className="mr-2 text-sm font-medium text-purple-300">
                                    span.op
                                  </span>
                                  <code className="font-mono text-sm text-purple-400">
                                    {spanOps.server}
                                  </code>
                                </button>
                                {copiedSpan === spanOps.server && (
                                  <div className="animate-fade-out absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-green-500/90 px-2 py-1 text-xs text-white">
                                    Copied!
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
