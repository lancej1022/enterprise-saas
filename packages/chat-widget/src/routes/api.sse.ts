import { server, transports } from "@/utils/demo.sse";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/sse").methods({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- this is a demo
  // @ts-ignore
  // eslint-disable-next-line no-empty-pattern -- this is a demo
  GET: async ({}) => {
    let body = "";
    const headers: Record<string, string> = {};
    const statusCode = 200;
    const resp = {
      on: (event: string, callback: () => void) => {
        if (event === "close") {
          callback();
        }
      },
      writeHead: (statusCode: number, headers: Record<string, string>) => {
        // eslint-disable-next-line no-self-assign -- this is a demo
        headers = headers;
        // eslint-disable-next-line no-self-assign -- this is a demo
        statusCode = statusCode;
      },
      write: (data: string) => {
        body += data + "\n";
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/consistent-type-assertions -- this is a demo
    const transport = new SSEServerTransport("/api/messages", resp as any);
    transports[transport.sessionId] = transport;
    transport.onerror = (error) => {
      console.error(error);
    };
    resp.on("close", () => {
      delete transports[transport.sessionId];
    });
    await server.connect(transport);
    const response = new Response(body, {
      status: statusCode,
      headers: headers,
    });
    return response;
  },
});
