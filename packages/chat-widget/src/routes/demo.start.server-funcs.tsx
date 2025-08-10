import fs from "node:fs";
import { useCallback, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const filePath = "todos.json";

async function readTodos() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- this is a demo
  return JSON.parse(
    await fs.promises.readFile(filePath, "utf-8").catch(() =>
      JSON.stringify(
        [
          { id: 1, name: "Get groceries" },
          { id: 2, name: "Buy a new phone" },
        ],
        null,
        2,
      ),
    ),
  );
}

const getTodos = createServerFn({
  method: "GET",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- this is a demo
}).handler(async () => await readTodos());

const addTodo = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- this is a demo
    const todos = await readTodos();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment -- this is a demo
    todos.push({ id: todos.length + 1, name: data });
    await fs.promises.writeFile(filePath, JSON.stringify(todos, null, 2));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- this is a demo
    return todos;
  });

export const Route = createFileRoute("/demo/start/server-funcs")({
  component: Home,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- this is a demo
  loader: async () => await getTodos(),
});

function Home() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- this is a demo
  let todos = Route.useLoaderData();

  const [todo, setTodo] = useState("");

  const submitTodo = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, react-hooks/react-compiler, react-hooks/exhaustive-deps -- this is a demo
    todos = await addTodo({ data: todo });
    setTodo("");

    void router.invalidate();
  }, [addTodo, todo]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-800 to-black p-4 text-white"
      style={{
        backgroundImage:
          "radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)",
      }}
    >
      <div className="w-full max-w-2xl rounded-xl border-8 border-black/10 bg-black/50 p-8 shadow-xl backdrop-blur-md">
        <h1 className="mb-4 text-2xl">Start Server Functions - Todo Example</h1>
        <ul className="mb-4 space-y-2">
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- this is a demo */}
          {todos?.map((t: any) => (
            <li
              className="rounded-lg border border-white/20 bg-white/10 p-3 shadow-md backdrop-blur-sm"
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- this is a demo
              key={t.id}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- this is a demo */}
              <span className="text-lg text-white">{t.name}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <input
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-blue-400 focus:outline-none"
            onChange={(e) => setTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void submitTodo();
              }
            }}
            placeholder="Enter a new todo..."
            type="text"
            value={todo}
          />
          <button
            className="rounded-lg bg-blue-500 px-4 py-3 font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-500/50"
            disabled={todo.trim().length === 0}
            onClick={submitTodo}
          >
            Add todo
          </button>
        </div>
      </div>
    </div>
  );
}
