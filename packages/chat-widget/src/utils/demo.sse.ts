import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import guitars from "#/data/example-guitars";

export const server = new McpServer({
  name: "guitar-server",
  version: "1.0.0",
});
export const transports: Record<string, SSEServerTransport> = {};

// eslint-disable-next-line no-empty-pattern, @typescript-eslint/require-await -- this is a demo
server.tool("getGuitars", {}, async ({}) => {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          guitars.map((guitar) => ({
            id: guitar.id,
            name: guitar.name,
            description: guitar.description,
            price: guitar.price,
            image: `http://localhost:3000${guitar.image}`,
          })),
        ),
      },
    ],
  };
});
