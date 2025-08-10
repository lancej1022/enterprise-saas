import { transports } from "@/utils/demo.sse";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/messages").methods({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- this is a demo
  // @ts-ignore
  POST: async ({ request }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- this is a demo
    const body = await request.json();
    const url = new URL(request.url);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- this is a demo
    const sessionId = url.searchParams.get("sessionId")!;

    const transport = transports[sessionId];
    if (transport) {
      try {
        await transport.handleMessage(body);
        return new Response(null, { status: 200 });
      } catch (error) {
        return new Response(null, { status: 500 });
      }
    } else {
      return new Response(null, { status: 404 });
    }
  },
});
