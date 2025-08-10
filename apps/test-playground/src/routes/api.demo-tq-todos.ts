import { createServerFileRoute } from "@tanstack/react-start/server";

const todos = [
  {
    id: 1,
    name: "Buy groceries",
  },
  {
    id: 2,
    name: "Buy mobile phone",
  },
  {
    id: 3,
    name: "Buy laptop",
  },
];

export const ServerRoute = createServerFileRoute("/api/demo-tq-todos").methods({
  GET: () => {
    return Response.json(todos);
  },
  POST: async ({ request }) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- from create-ts-router cli
    const name = (await request.json()) as string;
    const todo = {
      id: todos.length + 1,
      name,
    };
    todos.push(todo);
    return Response.json(todo);
  },
});
